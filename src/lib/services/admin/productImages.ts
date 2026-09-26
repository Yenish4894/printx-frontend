import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { MAX_PRODUCT_IMAGES, productImageKey } from "@/lib/productImages";
import { deleteUpload } from "@/lib/storage";

const view = (i: { id: string; url: string; alt: string | null; isPrimary: boolean; displayOrder: number }) => ({
  id: i.id,
  url: i.url,
  alt: i.alt,
  isPrimary: i.isPrimary,
  displayOrder: i.displayOrder,
});

const tooMany = () =>
  new HttpError(422, `A product can have up to ${MAX_PRODUCT_IMAGES} images. Remove one to add another.`);

export async function listProductImages(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new HttpError(404, "Product not found");
  const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { displayOrder: "asc" } });
  return images.map(view);
}

/**
 * Called BEFORE a file is stored: a request that was always going to be refused
 * (unknown product, already at the limit) must not leave an orphaned upload.
 */
export async function assertCanAddImage(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, _count: { select: { images: true } } },
  });
  if (!product) throw new HttpError(404, "Product not found");
  if (product._count.images >= MAX_PRODUCT_IMAGES) throw tooMany();
}

/** The first image becomes the primary one; later ones go to the end. */
export async function addProductImage(productId: string, data: { url: string; alt?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new HttpError(404, "Product not found");
    const existing = await tx.productImage.findMany({
      where: { productId },
      select: { url: true, displayOrder: true },
    });
    if (existing.length >= MAX_PRODUCT_IMAGES) throw tooMany();
    if (existing.some((e) => e.url === data.url)) throw new HttpError(422, "That image is already on this product.");
    const next = existing.length ? Math.max(...existing.map((e) => e.displayOrder)) + 1 : 0;
    const image = await tx.productImage.create({
      data: { productId, url: data.url, alt: data.alt?.trim() || null, isPrimary: existing.length === 0, displayOrder: next },
    });
    return view(image);
  });
}

/** Put one image first (the one the catalogue shows) and renumber the rest behind it. */
export async function makePrimaryImage(productId: string, imageId: string) {
  return prisma.$transaction(async (tx) => {
    const images = await tx.productImage.findMany({ where: { productId }, orderBy: { displayOrder: "asc" } });
    const target = images.find((i) => i.id === imageId);
    if (!target) throw new HttpError(404, "Image not found");
    const ordered = [target, ...images.filter((i) => i.id !== imageId)];
    for (let i = 0; i < ordered.length; i++) {
      const o = ordered[i];
      if (o.displayOrder !== i || o.isPrimary !== (i === 0)) {
        await tx.productImage.update({ where: { id: o.id }, data: { displayOrder: i, isPrimary: i === 0 } });
      }
    }
    return ordered.map((o, i) => view({ ...o, displayOrder: i, isPrimary: i === 0 }));
  });
}

/** Remove an image; if it was the primary one, the next in line takes over. */
export async function removeProductImage(productId: string, imageId: string) {
  const removed = await prisma.$transaction(async (tx) => {
    const image = await tx.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new HttpError(404, "Image not found");
    await tx.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({ where: { productId }, orderBy: { displayOrder: "asc" } });
      if (next) await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
    return image;
  });
  // After the commit, and best effort: the row is already gone, so a failure here
  // only leaves an unreferenced file behind, never a broken product.
  const key = productImageKey(removed.url);
  if (key) await deleteUpload(key).catch(() => {});
  return { id: imageId };
}

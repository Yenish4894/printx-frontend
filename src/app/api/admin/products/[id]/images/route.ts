import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError, HttpError } from "@/lib/http";
import { saveUpload, deleteUpload } from "@/lib/storage";
import { productImageFileProblem, productImageUrlForKey } from "@/lib/productImages";
import { productImageLinkSchema } from "@/lib/dto/admin";
import { addProductImage, assertCanAddImage, listProductImages } from "@/lib/services/admin/productImages";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ images: await listProductImages(id) });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Add a photo two ways: a file upload (multipart) or a pasted https link (JSON).
 * Uploads need object storage; links don't, so an admin can add photos even
 * before the R2 bucket exists.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new HttpError(422, "Choose an image to upload");
      const problem = productImageFileProblem(file);
      if (problem) throw new HttpError(422, problem);
      // Product exists and has room, checked before anything is stored.
      await assertCanAddImage(id);

      let stored;
      try {
        stored = await saveUpload(file);
      } catch (e) {
        return fail(422, e instanceof Error ? e.message : "Upload failed");
      }
      const alt = form.get("alt");
      try {
        const image = await addProductImage(id, {
          url: productImageUrlForKey(stored.key),
          alt: typeof alt === "string" ? alt : undefined,
        });
        return ok({ image }, 201);
      } catch (e) {
        // Lost a race (another add took the last slot): don't leave the file behind.
        await deleteUpload(stored.key).catch(() => {});
        throw e;
      }
    }

    const input = productImageLinkSchema.parse(await req.json());
    return ok({ image: await addProductImage(id, input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

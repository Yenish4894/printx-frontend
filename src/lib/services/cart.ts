import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { resolveAndPrice } from "./quote";
import { computeTotals } from "./pricing";
import { getSettings } from "./settings";
import type { AddCartItemInput } from "@/lib/dto/cart";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type Selections = Record<string, string | string[]>;

/** Current user's cart with per-item snapshots and cart-level totals. */
export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              // The cart's +/- controls need the product's ordering rules, or
              // they step by 1 into quantities the server rejects.
              minQuantity: true,
              quantityStep: true,
              maxQuantity: true,
              images: { take: 1, orderBy: { displayOrder: "asc" } },
            },
          },
          deliverySpeed: { select: { name: true, fee: true } },
        },
      },
    },
  });

  const { gstRate, freeShippingThreshold } = await getSettings();
  const items = (cart?.items ?? []).map((it) => {
    const deliveryFee = it.deliverySpeed ? Number(it.deliverySpeed.fee) : 0;
    const lineSubtotal = Number(it.lineSubtotal);
    const gstAmount = Number(it.gstAmount);
    return {
      id: it.id,
      productName: it.product.name,
      productSlug: it.product.slug,
      image: it.product.images[0]?.url ?? null,
      quantity: it.quantity,
      minQuantity: it.product.minQuantity,
      quantityStep: it.product.quantityStep,
      maxQuantity: it.product.maxQuantity,
      specSnapshot: it.specSnapshot,
      deliverySpeed: it.deliverySpeed?.name ?? null,
      deliveryFee,
      unitPrice: Number(it.unitPrice),
      lineSubtotal,
      gstAmount,
      lineTotal: round2(lineSubtotal + gstAmount + deliveryFee),
      fileStatus: it.fileStatus,
      fileName: it.fileName,
      notes: it.notes,
    };
  });

  const totals = computeTotals(items, gstRate, freeShippingThreshold);
  return { items, ...totals, count: items.length };
}

export async function addCartItem(userId: string, input: AddCartItemInput) {
  const quote = await resolveAndPrice(input);
  const { goodsTaxable, goodsGst } = quote.breakdown;

  let cart = await prisma.cart.findUnique({ where: { userId } });
  cart ??= await prisma.cart.create({ data: { userId } });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: input.productId,
      quantity: quote.quantity,
      width: input.width ?? null,
      height: input.height ?? null,
      deliverySpeedId: input.deliverySpeedId ?? null,
      config: input.selections,
      specSnapshot: quote.specSnapshot,
      // per-unit gross goods price (taxable + GST), for display
      unitPrice: round2((goodsTaxable + goodsGst) / quote.quantity),
      lineSubtotal: goodsTaxable, // goods taxable; delivery tracked via deliverySpeedId
      gstAmount: goodsGst,
      notes: input.notes ?? null,
    },
  });

  return getCart(userId);
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });
  if (!item) throw new HttpError(404, "Cart item not found");

  const quote = await resolveAndPrice({
    productId: item.productId,
    quantity,
    width: item.width ? Number(item.width) : undefined,
    height: item.height ? Number(item.height) : undefined,
    deliverySpeedId: item.deliverySpeedId ?? undefined,
    selections: (item.config as Selections) ?? {},
  });
  const { goodsTaxable, goodsGst } = quote.breakdown;

  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      // A slab product ignores the requested number and prices its own slab.
      quantity: quote.quantity,
      unitPrice: round2((goodsTaxable + goodsGst) / quote.quantity),
      lineSubtotal: goodsTaxable,
      gstAmount: goodsGst,
    },
  });

  return getCart(userId);
}

/** Attach an uploaded artwork file to a cart item. */
export async function setCartItemFile(
  userId: string,
  itemId: string,
  file: { url: string; name: string },
) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });
  if (!item) throw new HttpError(404, "Cart item not found");
  await prisma.cartItem.update({
    where: { id: itemId },
    data: { fileUrl: file.url, fileName: file.name, fileStatus: "UPLOADED" },
  });
  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });
  if (!item) throw new HttpError(404, "Cart item not found");

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

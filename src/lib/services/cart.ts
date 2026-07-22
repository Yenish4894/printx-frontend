import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { resolveAndPrice } from "./quote";
import { GST_RATE } from "./pricing";
import { getGstRate } from "./settings";
import type { AddCartItemInput } from "@/lib/dto/cart";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type Selections = Record<string, string | string[]>;

interface LineLike {
  lineSubtotal: number; // goods taxable (pre-GST value of base + add-ons)
  gstAmount: number; // GST on the goods (0 for none; back-calculated for inclusive)
  deliveryFee: number;
}

/**
 * Cart/order totals. Each line stores its own taxable value + GST (so GST-inclusive
 * MATRIX lines and GST-exclusive additive lines mix correctly). Delivery is a
 * taxable service — GST added on top.
 */
export function computeTotals(lines: LineLike[], gstRate = GST_RATE) {
  const subtotal = round2(lines.reduce((s, l) => s + l.lineSubtotal, 0));
  const deliveryCharge = round2(lines.reduce((s, l) => s + l.deliveryFee, 0));
  const goodsGst = round2(lines.reduce((s, l) => s + l.gstAmount, 0));
  const deliveryGst = round2(deliveryCharge * gstRate);
  const gst = round2(goodsGst + deliveryGst);
  const total = round2(subtotal + deliveryCharge + gst);
  return { subtotal, deliveryCharge, gst, total };
}

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
              images: { take: 1, orderBy: { displayOrder: "asc" } },
            },
          },
          deliverySpeed: { select: { name: true, fee: true } },
        },
      },
    },
  });

  const gstRate = await getGstRate();
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

  const totals = computeTotals(items, gstRate);
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
      quantity: input.quantity,
      width: input.width ?? null,
      height: input.height ?? null,
      deliverySpeedId: input.deliverySpeedId ?? null,
      config: input.selections,
      specSnapshot: quote.specSnapshot,
      // per-unit gross goods price (taxable + GST), for display
      unitPrice: round2((goodsTaxable + goodsGst) / input.quantity),
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
      quantity,
      unitPrice: round2((goodsTaxable + goodsGst) / quantity),
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

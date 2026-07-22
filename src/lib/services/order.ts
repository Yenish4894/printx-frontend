import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { computeTotals } from "./cart";
import { resolveAndPrice } from "./quote";
import { getGstRate } from "./settings";
import type { OrderStatus } from "@/generated/prisma/client";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Place an order from the user's cart — wallet-only payment.
 * All-or-nothing in a DB transaction: validate balance → create order + items
 * → debit wallet + ledger + payment → clear cart → notify.
 */
export async function placeOrder(
  userId: string,
  addressId: string,
  notes?: string,
) {
  // Retry only on a human order-number collision (two orders committing at once).
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await placeOrderTxn(userId, addressId, notes);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "P2002" && attempt < 4) continue; // duplicate orderNumber → retry
      throw e;
    }
  }
  throw new HttpError(409, "Could not place the order, please try again");
}

async function placeOrderTxn(userId: string, addressId: string, notes?: string) {
  // Load the cart and re-price every line against CURRENT products / rates / GST,
  // so a stale cart (deactivated product, changed rate, removed option, below new
  // min-qty) can't be checked out at a wrong or unavailable price.
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          deliverySpeed: { select: { fee: true, name: true, etaMinDays: true, etaMaxDays: true } },
          product: { select: { name: true } },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) {
    throw new HttpError(422, "Your cart is empty");
  }

  const priced = await Promise.all(
    cart.items.map(async (i) => {
      try {
        const q = await resolveAndPrice({
          productId: i.productId,
          quantity: i.quantity,
          selections: (i.config as Record<string, string | string[]>) ?? {},
          width: i.width ? Number(i.width) : undefined,
          height: i.height ? Number(i.height) : undefined,
          deliverySpeedId: i.deliverySpeedId ?? undefined,
        });
        return { item: i, bd: q.breakdown, snapshot: q.specSnapshot };
      } catch {
        throw new HttpError(
          422,
          `"${i.product.name}" is no longer available at the selected options — please review your cart.`,
        );
      }
    }),
  );

  const gstRate = await getGstRate();
  const lines = priced.map((p) => ({
    lineSubtotal: p.bd.goodsTaxable,
    gstAmount: p.bd.goodsGst,
    deliveryFee: p.bd.delivery,
  }));
  const { subtotal, deliveryCharge, gst, total } = computeTotals(lines, gstRate);

  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new HttpError(422, "Select a valid delivery address");

    // Atomically consume the cart FIRST — a given cart can be ordered only once,
    // even under concurrent submits (the loser sees an empty cart and rolls back).
    const consumed = await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (consumed.count === 0) throw new HttpError(422, "Your cart is empty");

    // Atomically debit — the WHERE guard makes the balance impossible to overspend
    // or double-spend; count === 0 means insufficient funds.
    const debit = await tx.user.updateMany({
      where: { id: userId, walletBalance: { gte: total } },
      data: { walletBalance: { decrement: total } },
    });
    if (debit.count === 0) {
      const u = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
      const short = round2(total - Number(u?.walletBalance ?? 0));
      throw new HttpError(
        422,
        `Insufficient wallet balance. Please top up ₹${short.toFixed(2)} to place this order.`,
      );
    }
    const fresh = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
    const newBalance = Number(fresh!.walletBalance);

    // Sequential-ish human order number (collisions retried by the caller).
    const year = new Date().getFullYear();
    const count = await tx.order.count();
    const seq = String(count + 1).padStart(5, "0");
    const orderNumber = `BG-${year}-${seq}`;
    const invoiceNumber = `INV-${year}-${seq}`;

    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        invoiceNumber,
        status: "PLACED",
        subtotal,
        deliveryCharge,
        gstAmount: gst,
        totalAmount: total,
        shippingSnapshot: {
          label: address.label,
          name: address.name,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
        },
        notes: notes ?? null,
        items: {
          create: priced.map(({ item: i, bd, snapshot }) => ({
            productId: i.productId,
            productName: i.product.name,
            quantity: i.quantity,
            width: i.width,
            height: i.height,
            deliverySpeedId: i.deliverySpeedId,
            deliveryEtaLabel: i.deliverySpeed
              ? `${i.deliverySpeed.name} · ${i.deliverySpeed.etaMinDays}–${i.deliverySpeed.etaMaxDays} business days`
              : null,
            config: i.config as object,
            specSnapshot: snapshot as object,
            unitPrice: round2((bd.goodsTaxable + bd.goodsGst) / i.quantity),
            lineSubtotal: bd.goodsTaxable,
            gstAmount: bd.goodsGst,
            fileUrl: i.fileUrl,
            fileName: i.fileName,
            fileStatus: i.fileStatus,
          })),
        },
        statusHistory: { create: { status: "PLACED", note: "Order placed" } },
      },
    });

    await tx.walletTransaction.create({
      data: {
        userId,
        type: "DEBIT",
        amount: total,
        balanceAfter: newBalance,
        reference: orderNumber,
        description: `Payment for order ${orderNumber}`,
        relatedOrderId: order.id,
      },
    });
    await tx.payment.create({
      data: {
        userId,
        purpose: "ORDER",
        method: "WALLET",
        amount: total,
        status: "SUCCESS",
        orderId: order.id,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "ORDER",
        title: `Order ${orderNumber} placed`,
        body: `Your order of ₹${total.toFixed(2)} is confirmed and now under review.`,
        link: `/orders/${order.id}`,
      },
    });

    return { id: order.id, orderNumber, invoiceNumber, totalAmount: total };
  });
}

// Statuses at which a customer may still cancel (before production starts).
const CANCELLABLE = ["PLACED", "PAYMENT_CONFIRMED", "DESIGN_REVIEW"] as OrderStatus[];

/**
 * Cancel an order and refund its total back to the wallet.
 * All-or-nothing: mark CANCELLED + history → credit wallet + REFUND ledger +
 * refund record → notify. The status transition is atomic (updateMany with a
 * status guard) so concurrent cancels refund at most once.
 */
export async function cancelOrder(userId: string, id: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    // Atomically claim the cancellation — only one concurrent request wins.
    const claimed = await tx.order.updateMany({
      where: { id, userId, status: { in: CANCELLABLE } },
      data: { status: "CANCELLED" },
    });
    if (claimed.count === 0) {
      const exists = await tx.order.findFirst({ where: { id, userId } });
      if (!exists) throw new HttpError(404, "Order not found");
      if (exists.status === "CANCELLED") {
        throw new HttpError(422, "This order is already cancelled");
      }
      throw new HttpError(
        422,
        "This order can no longer be cancelled — it is already in production.",
      );
    }

    const order = (await tx.order.findFirst({ where: { id, userId } }))!;
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: "CANCELLED", note: reason ?? "Cancelled by customer" },
    });

    const refund = round2(Number(order.totalAmount));
    const user = await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: refund } },
    });
    const newBalance = Number(user.walletBalance);
    await tx.walletTransaction.create({
      data: {
        userId,
        type: "REFUND",
        amount: refund,
        balanceAfter: newBalance,
        reference: order.orderNumber,
        description: `Refund for cancelled order ${order.orderNumber}`,
        relatedOrderId: id,
      },
    });
    await tx.refund.create({
      data: {
        userId,
        orderId: id,
        amount: refund,
        status: "CREDITED",
        reason: reason ?? "Order cancelled",
        processedAt: new Date(),
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "ORDER",
        title: `Order ${order.orderNumber} cancelled`,
        body: `₹${refund.toFixed(2)} has been refunded to your wallet.`,
        link: `/orders/${id}`,
      },
    });

    return { id, status: "CANCELLED", refunded: refund, walletBalance: newBalance };
  });
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" },
    include: { items: { select: { productName: true, quantity: true } } },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    itemCount: o.items.length,
    items: o.items.map((i) => `${i.quantity} × ${i.productName}`),
    placedAt: o.placedAt,
  }));
}

/** Attach / replace an uploaded artwork file on an order item. */
export async function setOrderItemFile(
  userId: string,
  orderId: string,
  itemId: string,
  file: { url: string; name: string },
) {
  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId, order: { userId } },
  });
  if (!item) throw new HttpError(404, "Order item not found");
  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      fileUrl: file.url,
      fileName: file.name,
      fileStatus: "UPLOADED",
      fileRejectReason: null,
    },
  });
  return getOrder(userId, orderId);
}

export async function getOrder(userId: string, id: string) {
  const o = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!o) throw new HttpError(404, "Order not found");

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    invoiceNumber: o.invoiceNumber,
    status: o.status,
    subtotal: Number(o.subtotal),
    deliveryCharge: Number(o.deliveryCharge),
    gstAmount: Number(o.gstAmount),
    totalAmount: Number(o.totalAmount),
    shipping: o.shippingSnapshot,
    notes: o.notes,
    placedAt: o.placedAt,
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
      specSnapshot: i.specSnapshot,
      unitPrice: Number(i.unitPrice),
      lineSubtotal: Number(i.lineSubtotal),
      deliveryEtaLabel: i.deliveryEtaLabel,
      fileStatus: i.fileStatus,
      fileName: i.fileName,
      fileRejectReason: i.fileRejectReason,
    })),
    statusHistory: o.statusHistory.map((h) => ({
      status: h.status,
      note: h.note,
      at: h.createdAt,
    })),
  };
}

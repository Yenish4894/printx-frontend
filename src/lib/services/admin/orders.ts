import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { OrderStatus } from "@/generated/prisma/client";
import type { OrderStatusInput, FileReviewInput } from "@/lib/dto/admin";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listAllOrders(status?: OrderStatus) {
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    orderBy: { placedAt: "desc" },
    include: {
      user: { select: { businessName: true, ownerName: true, mobile: true } },
      _count: { select: { items: true } },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    customer: o.user.businessName,
    customerMobile: o.user.mobile,
    totalAmount: Number(o.totalAmount),
    itemCount: o._count.items,
    placedAt: o.placedAt,
  }));
}

export async function getAdminOrder(id: string) {
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, businessName: true, ownerName: true, mobile: true, email: true } },
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      refunds: true,
      payment: true,
    },
  });
  if (!o) throw new HttpError(404, "Order not found");
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    invoiceNumber: o.invoiceNumber,
    status: o.status,
    customer: {
      id: o.user.id,
      businessName: o.user.businessName,
      ownerName: o.user.ownerName,
      mobile: o.user.mobile,
      email: o.user.email,
    },
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
      gstAmount: Number(i.gstAmount),
      deliveryEtaLabel: i.deliveryEtaLabel,
      fileUrl: i.fileUrl,
      fileName: i.fileName,
      fileStatus: i.fileStatus,
      fileRejectReason: i.fileRejectReason,
    })),
    statusHistory: o.statusHistory.map((h) => ({ status: h.status, note: h.note, at: h.createdAt })),
    refunds: o.refunds.map((r) => ({ id: r.id, amount: Number(r.amount), status: r.status, reason: r.reason })),
    payment: o.payment ? { method: o.payment.method, status: o.payment.status, amount: Number(o.payment.amount) } : null,
  };
}

/**
 * Update order status. Moving to CANCELLED refunds the total to the wallet
 * (same as a customer cancel). Every change is logged + the customer notified.
 */
export async function updateOrderStatus(id: string, input: OrderStatusInput) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status === input.status) {
      throw new HttpError(422, `Order is already ${input.status}`);
    }

    const cancelling = input.status === "CANCELLED" && order.status !== "CANCELLED";

    if (cancelling) {
      // Atomically claim the cancellation so concurrent cancels refund at most once.
      const claimed = await tx.order.updateMany({
        where: { id, status: { not: "CANCELLED" } },
        data: { status: "CANCELLED" },
      });
      if (claimed.count === 0) throw new HttpError(422, "Order is already cancelled");
    } else {
      await tx.order.update({ where: { id }, data: { status: input.status } });
    }
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: input.status, note: input.note ?? `Marked ${input.status} by admin` },
    });

    if (cancelling) {
      const refund = round2(Number(order.totalAmount));
      const user = await tx.user.update({
        where: { id: order.userId },
        data: { walletBalance: { increment: refund } },
      });
      const newBalance = Number(user.walletBalance);
      await tx.walletTransaction.create({
        data: {
          userId: order.userId,
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
          userId: order.userId,
          orderId: id,
          amount: refund,
          status: "CREDITED",
          reason: input.note ?? "Cancelled by admin",
          processedAt: new Date(),
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER",
        title: `Order ${order.orderNumber} — ${input.status.replace(/_/g, " ").toLowerCase()}`,
        body: cancelling
          ? `Your order was cancelled and ₹${Number(order.totalAmount).toFixed(2)} refunded to your wallet.`
          : input.note ?? `Your order status is now ${input.status.replace(/_/g, " ").toLowerCase()}.`,
        link: `/orders/${id}`,
      },
    });

    return { id, status: input.status };
  });
}

/** Approve / reject a customer's uploaded artwork on an order item. */
export async function reviewOrderItemFile(
  orderId: string,
  itemId: string,
  input: FileReviewInput,
) {
  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId },
    include: { order: { select: { userId: true, orderNumber: true } } },
  });
  if (!item) throw new HttpError(404, "Order item not found");
  if (!item.fileUrl) throw new HttpError(422, "No file has been uploaded for this item");

  const approve = input.action === "APPROVE";
  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      fileStatus: approve ? "APPROVED" : "REJECTED",
      fileRejectReason: approve ? null : input.reason ?? "Please re-upload print-ready artwork",
    },
  });
  await prisma.notification.create({
    data: {
      userId: item.order.userId,
      type: "ORDER",
      title: approve ? "Artwork approved" : "Artwork needs changes",
      body: approve
        ? `Your artwork for ${item.productName} (order ${item.order.orderNumber}) was approved.`
        : `Artwork for ${item.productName} was rejected: ${input.reason ?? "please re-upload"}.`,
      link: `/orders/${orderId}`,
    },
  });
  return { id: itemId, fileStatus: approve ? "APPROVED" : "REJECTED" };
}

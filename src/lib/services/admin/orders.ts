import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { nextStatuses, statusLabel } from "@/lib/orderStatus";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import type { OrderStatusInput, FileReviewInput, PaymentReviewInput } from "@/lib/dto/admin";
import { raiseRefundIfPaid, isProofInReview, lockOrder, unpaidCancelCopy } from "@/lib/services/order";
import { invoicePrefix, nextInvoiceNumber } from "@/lib/orderNumber";
import { firstPage, pageMeta, type PageParams } from "@/lib/pagination";

export async function listAllOrders(
  status?: OrderStatus,
  page: PageParams = firstPage(),
  q?: string,
) {
  // Search runs in the DB, not in the browser: filtering client-side over a
  // paginated list would only ever search the page you are looking at.
  const term = q?.trim();
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(term
      ? {
          OR: [
            { orderNumber: { contains: term, mode: "insensitive" as const } },
            { user: { businessName: { contains: term, mode: "insensitive" as const } } },
            { user: { ownerName: { contains: term, mode: "insensitive" as const } } },
            { user: { mobile: { contains: term } } },
          ],
        }
      : {}),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: page.skip,
      take: page.take,
      include: {
        user: { select: { businessName: true, ownerName: true, mobile: true } },
        _count: { select: { items: true } },
        payment: { select: { status: true, proofUrl: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  const rows = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    payment: o.payment ? { status: o.payment.status, hasProof: !!o.payment.proofUrl } : null,
    customer: o.user.businessName,
    customerMobile: o.user.mobile,
    totalAmount: Number(o.totalAmount),
    itemCount: o._count.items,
    placedAt: o.placedAt,
  }));
  return { orders: rows, ...pageMeta(rows.length, total, page) };
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

  // One transfer can be offered as proof for several orders. Each review looks
  // at a single order, so flag any other order quoting the same UTR.
  // References are stored normalized (see normalizeReference), so an exact
  // match catches "412 345-678" vs "412345678" without a pattern search.
  const reference = o.payment?.reference;
  const referenceUsedOn = reference
    ? (
        await prisma.payment.findMany({
          where: {
            reference,
            orderId: { not: o.id },
            status: { in: ["PENDING", "SUCCESS"] },
          },
          select: { order: { select: { orderNumber: true } } },
          take: 5,
        })
      )
        .map((p) => p.order?.orderNumber)
        .filter((n): n is string => !!n)
    : [];

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
    payment: o.payment
      ? {
          method: o.payment.method,
          status: o.payment.status,
          amount: Number(o.payment.amount),
          proofUrl: o.payment.proofUrl,
          proofName: o.payment.proofName,
          proofUploadedAt: o.payment.proofUploadedAt,
          reference: o.payment.reference,
          rejectReason: o.payment.rejectReason,
          reviewedAt: o.payment.reviewedAt,
          referenceUsedOn,
        }
      : null,
  };
}

/**
 * Update order status. Moving a paid order to CANCELLED raises a PENDING refund
 * for the team to send by bank transfer (same rule as a customer cancel).
 * Every change is logged + the customer notified.
 */
export async function updateOrderStatus(id: string, input: OrderStatusInput) {
  return prisma.$transaction(async (tx) => {
    await lockOrder(tx, id);
    const order = await tx.order.findUnique({ where: { id }, include: { payment: true } });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status === input.status) {
      throw new HttpError(422, `Order is already ${statusLabel(input.status)}`);
    }

    // The pipeline is a business rule, not a UI convenience. Enforcing it only
    // in the admin dropdown left the API able to move an order anywhere:
    // DELIVERED → CANCELLED would refund goods already delivered, and
    // CANCELLED → PLACED would revive an order whose money was already
    // refunded — the customer keeps both.
    const allowed = nextStatuses(order.status);
    if (!allowed.includes(input.status)) {
      throw new HttpError(
        422,
        allowed.length === 0
          ? `${statusLabel(order.status)} is a final status — this order can no longer be changed.`
          : `Cannot move an order from ${statusLabel(order.status)} to ${statusLabel(input.status)}. ` +
            `Allowed: ${allowed.map((s) => statusLabel(s)).join(", ")}.`,
      );
    }

    const cancelling = input.status === "CANCELLED" && order.status !== "CANCELLED";
    // A proof awaiting review probably means the money was sent. Cancelling
    // would skip the refund (the payment isn't verified) and drop it from the
    // review queue, so the proof is approved or rejected first.
    if (cancelling && isProofInReview(order)) {
      throw new HttpError(422, "Approve or reject the payment proof before cancelling this order.");
    }

    // Claim the transition against the status and payment state just validated.
    // Guarding only on "not CANCELLED" let a cancel land on an order a payment
    // approval had moved to PLACED a moment earlier; the refund check then read
    // the stale unpaid snapshot, so the money was kept with no refund raised.
    const claimed = await tx.order.updateMany({
      where: {
        id,
        status: order.status,
        ...(order.payment
          ? { payment: { is: { status: order.payment.status, proofUrl: order.payment.proofUrl } } }
          : {}),
      },
      data: { status: input.status },
    });
    if (claimed.count === 0) {
      throw new HttpError(409, "This order changed while you were updating it. Refresh and try again.");
    }
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: input.status, note: input.note ?? `Marked ${input.status} by admin` },
    });

    const refund = cancelling
      ? await raiseRefundIfPaid(tx, order, input.note ?? "Cancelled by admin")
      : 0;

    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER",
        title: `Order ${order.orderNumber} — ${statusLabel(input.status).toLowerCase()}`,
        body: cancelling
          ? refund
            ? `Your order was cancelled. A refund of ₹${refund.toFixed(2)} will be sent to your bank account.`
            : unpaidCancelCopy(order.payment)
          : input.note ?? `Your order status is now ${statusLabel(input.status).toLowerCase()}.`,
        link: `/orders/${id}`,
      },
    });

    return { id, status: input.status, refundAmount: refund };
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

/**
 * Approve or reject a customer's proof of bank transfer.
 *
 * APPROVE: payment -> SUCCESS, order PAYMENT_PENDING -> PLACED, and the next
 * invoice number in this financial year's series is issued now (an order that
 * is never paid never takes one, so the series has no gaps).
 * REJECT: payment -> FAILED with the reason; the order stays PAYMENT_PENDING so
 * the customer can upload a new proof.
 *
 * Both are claimed with guarded updateMany so two admins acting at once cannot
 * approve twice, or approve a proof the other just rejected.
 */
export async function reviewPayment(orderId: string, adminId: string, input: PaymentReviewInput) {
  // Two approvals committing at once can pick the same invoice number; the
  // unique index refuses the second, whose whole transaction rolled back, so
  // it simply runs again and takes the next number.
  for (let attempt = 0; ; attempt++) {
    try {
      return await reviewPaymentTxn(orderId, adminId, input);
    } catch (e) {
      if ((e as { code?: string })?.code === "P2002" && attempt < 4) continue;
      throw e;
    }
  }
}

async function reviewPaymentTxn(orderId: string, adminId: string, input: PaymentReviewInput) {
  return prisma.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { payment: true } });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status !== "PAYMENT_PENDING") {
      throw new HttpError(
        422,
        order.status === "CANCELLED"
          ? "This order was cancelled."
          : "This order's payment has already been verified.",
      );
    }
    if (!order.payment?.proofUrl) {
      throw new HttpError(422, "The customer hasn't uploaded a payment proof yet.");
    }
    if (order.payment.status !== "PENDING") {
      throw new HttpError(422, "This proof was already reviewed. Wait for the customer to upload a new one.");
    }
    if (input.proofUrl && input.proofUrl !== order.payment.proofUrl) {
      throw new HttpError(409, "The customer uploaded a new screenshot while you were reviewing. Refresh to see it.");
    }

    const now = new Date();
    const claimed = await tx.payment.updateMany({
      where: { id: order.payment.id, status: "PENDING", proofUrl: order.payment.proofUrl },
      data:
        input.action === "APPROVE"
          ? { status: "SUCCESS", reviewedAt: now, reviewedById: adminId, rejectReason: null }
          : { status: "FAILED", reviewedAt: now, reviewedById: adminId, rejectReason: input.reason! },
    });
    if (claimed.count === 0) throw new HttpError(409, "Someone else just reviewed this payment. Refresh to see it.");

    if (input.action === "APPROVE") {
      const lastInvoice = await tx.order.findFirst({
        where: { invoiceNumber: { startsWith: invoicePrefix(now) } },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
      });
      const moved = await tx.order.updateMany({
        where: { id: orderId, status: "PAYMENT_PENDING" },
        data: { status: "PLACED", invoiceNumber: nextInvoiceNumber(now, lastInvoice?.invoiceNumber ?? null) },
      });
      if (moved.count === 0) throw new HttpError(409, "This order changed while you were reviewing it. Refresh and try again.");
      await tx.orderStatusHistory.create({
        data: { orderId, status: "PLACED", note: input.reason || "Payment verified — order placed" },
      });
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER",
          title: `Order ${order.orderNumber} placed`,
          body: `We've received your payment of ₹${Number(order.totalAmount).toFixed(2)}. Your order is confirmed and moving to production.`,
          link: `/orders/${orderId}`,
        },
      });
      return { id: orderId, status: "PLACED" as const, payment: "SUCCESS" as const };
    }

    await tx.orderStatusHistory.create({
      data: { orderId, status: "PAYMENT_PENDING", note: `Payment proof rejected: ${input.reason}` },
    });
    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER",
        title: `Order ${order.orderNumber} — payment proof needs another look`,
        body: `${input.reason} Please upload a new payment screenshot.`,
        link: `/orders/${orderId}`,
      },
    });
    return { id: orderId, status: "PAYMENT_PENDING" as const, payment: "FAILED" as const };
  });
}

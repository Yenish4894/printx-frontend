import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { computeTotals } from "./pricing";
import { resolveAndPrice, loadPricingProducts } from "./quote";
import { getSettings } from "./settings";
import { bankDetailsComplete, normalizeReference } from "@/lib/paymentRules";
import { firstPage, pageMeta, type PageParams } from "@/lib/pagination";
import { canStoreUploads } from "@/lib/storage";
import { nextOrderNumber, orderNumberPrefix } from "@/lib/orderNumber";
import {
  ACTIVE_STATUSES,
  CANCELLABLE_STATUSES,
  IN_PRODUCTION_STATUSES,
  UNPAID_OR_VOID_STATUSES,
} from "@/lib/orderStatus";
import type { Prisma } from "@/generated/prisma/client";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Place an order from the user's cart. Payment is by bank transfer: the order is
 * created as PAYMENT_PENDING with a PENDING bank-transfer Payment, and moves to
 * PLACED only when an admin approves the customer's proof of transfer.
 * All-or-nothing in a DB transaction: create order + items + payment → clear
 * cart → notify. No money moves here.
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

  // Re-pricing every line used to cost two Neon round trips per line (the
  // product graph + the GST rate). Both are shared across the whole cart, so
  // they are fetched once here and handed to each call.
  const [products, { gstRate, freeShippingThreshold, bank }] = await Promise.all([
    loadPricingProducts(cart.items.map((i) => i.productId)),
    getSettings(),
  ]);

  // An order the customer cannot pay for is a dead end: refuse it up front
  // rather than show a payment screen with no account to transfer to.
  if (!bankDetailsComplete(bank)) {
    throw new HttpError(
      503,
      "We can't take new orders right now because our payment details are being updated. Please try again shortly or contact us.",
    );
  }
  // Same dead end if the payment screenshot has nowhere to go: the customer
  // would transfer real money and the order could never be approved.
  if (!(await canStoreUploads())) {
    throw new HttpError(
      503,
      "We can't take new orders right now because payment uploads are unavailable. Please try again shortly or contact us.",
    );
  }

  const priced = await Promise.all(
    cart.items.map(async (i) => {
      try {
        const q = await resolveAndPrice(
          {
            productId: i.productId,
            quantity: i.quantity,
            selections: (i.config as Record<string, string | string[]>) ?? {},
            width: i.width ? Number(i.width) : undefined,
            height: i.height ? Number(i.height) : undefined,
            deliverySpeedId: i.deliverySpeedId ?? undefined,
          },
          { product: products.get(i.productId), gstRate },
        );
        // q.quantity — NOT i.quantity — is what was priced. They differ when the
        // product prices quantity as a spec slab, and storing the stale one
        // would file an order whose quantity and price disagree.
        return { item: i, bd: q.breakdown, snapshot: q.specSnapshot, quantity: q.quantity };
      } catch {
        throw new HttpError(
          422,
          `"${i.product.name}" is no longer available at the selected options — please review your cart.`,
        );
      }
    }),
  );

  const lines = priced.map((p) => ({
    lineSubtotal: p.bd.goodsTaxable,
    gstAmount: p.bd.goodsGst,
    deliveryFee: p.bd.delivery,
  }));
  const { subtotal, deliveryCharge, gst, total } = computeTotals(
    lines,
    gstRate,
    freeShippingThreshold,
  );

  // Re-pricing protects the business from a stale cart, but it must not silently
  // charge the customer something other than the total they were shown. Compare
  // against the cart's own stored figures — exactly what /api/cart rendered —
  // and make them re-confirm if the number moved.
  const shownTotal = computeTotals(
    cart.items.map((i) => ({
      lineSubtotal: Number(i.lineSubtotal),
      gstAmount: Number(i.gstAmount),
      deliveryFee: i.deliverySpeed ? Number(i.deliverySpeed.fee) : 0,
    })),
    gstRate,
    freeShippingThreshold,
  ).total;
  if (Math.abs(shownTotal - total) > 0.01) {
    throw new HttpError(
      409,
      `Prices changed while this order was in your cart — it is now ₹${total.toFixed(2)} ` +
        `instead of ₹${shownTotal.toFixed(2)}. Please review your cart and place the order again.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new HttpError(422, "Select a valid delivery address");

    // Atomically consume the cart FIRST — a given cart can be ordered only once,
    // even under concurrent submits (the loser sees an empty cart and rolls back).
    const consumed = await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (consumed.count === 0) throw new HttpError(422, "Your cart is empty");

    // Human order number: one past the highest issued this year (see
    // nextOrderNumber for why it is not count() + 1). A genuine race between
    // two checkouts still hits the unique index and is retried by the caller.
    // No invoice number yet: an invoice is issued when payment is verified.
    const year = new Date().getFullYear();
    const last = await tx.order.findFirst({
      where: { orderNumber: { startsWith: orderNumberPrefix(year) } },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const orderNumber = nextOrderNumber(year, last?.orderNumber ?? null);

    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: "PAYMENT_PENDING",
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
          create: priced.map(({ item: i, bd, snapshot, quantity }) => ({
            productId: i.productId,
            productName: i.product.name,
            quantity,
            width: i.width,
            height: i.height,
            deliverySpeedId: i.deliverySpeedId,
            deliveryEtaLabel: i.deliverySpeed
              ? `${i.deliverySpeed.name} · ${i.deliverySpeed.etaMinDays}–${i.deliverySpeed.etaMaxDays} business days`
              : null,
            config: i.config as object,
            specSnapshot: snapshot as object,
            unitPrice: round2((bd.goodsTaxable + bd.goodsGst) / quantity),
            lineSubtotal: bd.goodsTaxable,
            gstAmount: bd.goodsGst,
            fileUrl: i.fileUrl,
            fileName: i.fileName,
            fileStatus: i.fileStatus,
          })),
        },
        statusHistory: {
          create: { status: "PAYMENT_PENDING", note: "Order created — awaiting payment" },
        },
      },
    });

    await tx.payment.create({
      data: {
        userId,
        purpose: "ORDER",
        method: "BANK_TRANSFER",
        amount: total,
        status: "PENDING",
        orderId: order.id,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "ORDER",
        title: `Order ${orderNumber} — complete your payment`,
        body: `Transfer ₹${total.toFixed(2)} to our bank account and upload the payment screenshot to confirm your order.`,
        link: `/orders/${order.id}`,
      },
    });

    return { id: order.id, orderNumber, totalAmount: total, status: "PAYMENT_PENDING" as const };
  });
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Take the order's row lock for the rest of the transaction. Cancel, proof
 * upload and payment review each decide from BOTH the order and its payment,
 * but write only one of them, so under READ COMMITTED an upload and a cancel
 * could each pass on the other's pre-commit state (write skew): a cancelled
 * order holding a fresh proof, with no refund. Taking this lock first makes
 * them queue, and every read after it sees the other side's committed write.
 */
export async function lockOrder(tx: Tx, id: string) {
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${id} FOR UPDATE`;
}

/** What to tell the customer when an unpaid order is cancelled. */
export const unpaidCancelCopy = (payment: { proofUrl: string | null } | null) =>
  payment?.proofUrl
    ? "Your order has been cancelled. If you already transferred money for it, contact us and we'll refund it."
    : "Your order has been cancelled. No payment was taken.";

/** A payment whose proof is uploaded and not yet reviewed. */
const PROOF_IN_REVIEW = { status: "PENDING", proofUrl: { not: null } } satisfies Prisma.PaymentWhereInput;

export const isProofInReview = (o: { status: string; payment: { status: string; proofUrl: string | null } | null }) =>
  o.status === "PAYMENT_PENDING" && o.payment?.status === "PENDING" && !!o.payment.proofUrl;

/**
 * If the order's payment was verified, raise a PENDING refund for an admin to
 * send back by bank transfer, and return its amount; otherwise return 0.
 * Shared by customer and admin cancellation so the two cannot drift.
 */
export async function raiseRefundIfPaid(
  tx: Tx,
  order: { id: string; userId: string; totalAmount: unknown; payment: { status: string } | null },
  reason: string,
): Promise<number> {
  if (order.payment?.status !== "SUCCESS") return 0;
  const amount = round2(Number(order.totalAmount));
  await tx.refund.create({
    data: { userId: order.userId, orderId: order.id, amount, status: "PENDING", reason },
  });
  return amount;
}

/**
 * Cancel an order.
 *
 * Unpaid (still PAYMENT_PENDING, payment never verified): nothing to refund.
 * Paid: a PENDING refund is raised for an admin to send back by bank transfer;
 * nothing is credited in the app. The status transition is atomic
 * (updateMany with a status guard) so concurrent cancels raise at most one.
 */
export async function cancelOrder(userId: string, id: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    await lockOrder(tx, id);
    // Atomically claim the cancellation — only one concurrent request wins.
    // Not while a payment proof awaits review: the customer has probably sent
    // the money, and cancelling would drop it from the review queue with no
    // refund raised. The team approves or rejects the proof first.
    const claimed = await tx.order.updateMany({
      where: { id, userId, status: { in: CANCELLABLE_STATUSES }, NOT: { payment: { is: PROOF_IN_REVIEW } } },
      data: { status: "CANCELLED" },
    });
    if (claimed.count === 0) {
      const exists = await tx.order.findFirst({ where: { id, userId }, include: { payment: true } });
      if (!exists) throw new HttpError(404, "Order not found");
      if (exists.status === "CANCELLED") {
        throw new HttpError(422, "This order is already cancelled");
      }
      if (isProofInReview(exists)) {
        throw new HttpError(
          422,
          "We're checking your payment proof, so this order can't be cancelled right now. Contact us if you need to cancel.",
        );
      }
      throw new HttpError(
        422,
        "This order can no longer be cancelled — it is already in production.",
      );
    }

    const order = (await tx.order.findFirst({ where: { id, userId }, include: { payment: true } }))!;
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: "CANCELLED", note: reason ?? "Cancelled by customer" },
    });

    const refund = await raiseRefundIfPaid(tx, order, reason ?? "Order cancelled by customer");
    await tx.notification.create({
      data: {
        userId,
        type: "ORDER",
        title: `Order ${order.orderNumber} cancelled`,
        body: refund
          ? `A refund of ₹${refund.toFixed(2)} will be sent to your bank account. We'll let you know once it's done.`
          : unpaidCancelCopy(order.payment),
        link: `/orders/${id}`,
      },
    });

    return { id, status: "CANCELLED" as const, refundAmount: refund, refundPending: refund > 0 };
  });
}

/** The tabs the orders page offers, as server-side status filters. */
export type OrderBucket = "all" | "active" | "completed" | "cancelled";

function bucketFilter(bucket: OrderBucket): Prisma.OrderWhereInput {
  if (bucket === "active") return { status: { in: ACTIVE_STATUSES } };
  if (bucket === "completed") return { status: "DELIVERED" };
  if (bucket === "cancelled") return { status: "CANCELLED" };
  return {};
}

export async function listOrders(
  userId: string,
  page: PageParams = firstPage(),
  bucket: OrderBucket = "all",
  q?: string,
) {
  const term = q?.trim();
  // Search narrows the tab badges too, minus the tab's own filter: otherwise a
  // search matching nothing still renders "All 1" above an empty list.
  const searched: Prisma.OrderWhereInput = {
    userId,
    ...(term
      ? {
          OR: [
            { orderNumber: { contains: term, mode: "insensitive" as const } },
            { items: { some: { productName: { contains: term, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };
  const where: Prisma.OrderWhereInput = { ...searched, ...bucketFilter(bucket) };
  // The dashboard KPIs used to be computed in the browser by downloading every
  // order the customer had ever placed. They are aggregates now, so the list
  // itself can be a page.
  const [orders, total, byStatus, spend] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: page.skip,
      take: page.take,
      include: { items: { select: { productName: true, quantity: true } } },
    }),
    prisma.order.count({ where }),
    // One groupBy powers every tab badge and the dashboard KPIs; counting them
    // in the browser meant downloading every order the customer ever placed.
    prisma.order.groupBy({ by: ["status"], _count: { _all: true }, where: searched }),
    // Spend is money actually received: unpaid orders are not spend yet.
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { userId, status: { notIn: UNPAID_OR_VOID_STATUSES } },
    }),
  ]);

  const per: Record<string, number> = {};
  let allCount = 0;
  for (const g of byStatus) {
    per[g.status] = g._count._all;
    allCount += g._count._all;
  }
  const activeCount = ACTIVE_STATUSES.reduce((n, s) => n + (per[s] ?? 0), 0);
  // Unpaid orders are in the Active tab (the customer still has to pay) but
  // not "in progress": they have their own awaitingPayment figure.
  const inProductionCount = IN_PRODUCTION_STATUSES.reduce((n, s) => n + (per[s] ?? 0), 0);
  const buckets = {
    all: allCount,
    active: activeCount,
    completed: per.DELIVERED ?? 0,
    cancelled: per.CANCELLED ?? 0,
  };
  const rows = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    itemCount: o.items.length,
    items: o.items.map((i) => `${i.quantity} × ${i.productName}`),
    placedAt: o.placedAt,
  }));
  return {
    orders: rows,
    ...pageMeta(rows.length, total, page),
    buckets,
    stats: {
      totalOrders: allCount,
      inProgress: inProductionCount,
      awaitingPayment: per.PAYMENT_PENDING ?? 0,
      paidOrderCount: spend._count,
      totalSpent: round2(Number(spend._sum.totalAmount ?? 0)),
    },
  };
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
      payment: true,
      refunds: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!o) throw new HttpError(404, "Order not found");
  const awaitingPayment = o.status === "PAYMENT_PENDING";
  // Settings are only needed for the bank details, which only an unpaid order shows.
  const bankDetails = awaitingPayment ? (await getSettings()).bank : null;

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
        }
      : null,
    // Only on the customer's own unpaid order: bank details are not published
    // anywhere else, and a paid order has no use for them.
    bankDetails,
    refunds: o.refunds.map((r) => ({
      amount: Number(r.amount),
      status: r.status,
      reason: r.reason,
      processedAt: r.processedAt,
    })),
  };
}

/**
 * The order a proof is for, if it can take one: the caller's own order, still
 * PAYMENT_PENDING. The upload route calls this before storing the file, so a
 * request that was always going to fail doesn't leave an orphaned object.
 */
export async function proofTarget(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, orderNumber: true, payment: { select: { id: true, status: true } } },
  });
  if (!order) throw new HttpError(404, "Order not found");
  if (order.status !== "PAYMENT_PENDING") {
    throw new HttpError(
      422,
      order.status === "CANCELLED"
        ? "This order was cancelled, so no payment is needed."
        : "Payment for this order has already been verified.",
    );
  }
  return order;
}

/**
 * Attach (or replace, after a rejection) the customer's proof of bank transfer.
 * Allowed only while the order is PAYMENT_PENDING and the payment is not yet
 * verified. The guarded updateMany means a proof cannot land on a payment an
 * admin approved a moment earlier.
 */
export async function submitPaymentProof(
  userId: string,
  orderId: string,
  file: { url: string; name: string },
  reference?: string,
) {
  await proofTarget(userId, orderId);

  const ref = normalizeReference(reference);
  await prisma.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    // Read the payment under the lock: a double-submit must see the row the
    // first request created, not the pre-lock snapshot.
    const payment = await tx.payment.findUnique({ where: { orderId }, select: { status: true } });
    // Orders created before this change may lack a payment row; make one.
    if (!payment) {
      const o = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { totalAmount: true } });
      await tx.payment.create({
        data: { userId, purpose: "ORDER", method: "BANK_TRANSFER", amount: o.totalAmount, status: "PENDING", orderId },
      });
    }
    const updated = await tx.payment.updateMany({
      where: { orderId, status: { in: ["PENDING", "FAILED"] }, order: { status: "PAYMENT_PENDING" } },
      data: {
        method: "BANK_TRANSFER",
        proofUrl: file.url,
        proofName: file.name,
        proofUploadedAt: new Date(),
        reference: ref,
        status: "PENDING",
        rejectReason: null,
      },
    });
    if (updated.count === 0) throw new HttpError(422, "Payment for this order has already been verified.");
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "PAYMENT_PENDING",
        note: payment?.status === "FAILED" ? "New payment proof uploaded" : "Payment proof uploaded",
      },
    });
  });

  return getOrder(userId, orderId);
}

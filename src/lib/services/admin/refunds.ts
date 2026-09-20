import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { RefundProcessInput } from "@/lib/dto/admin";
import type { RefundStatus } from "@/generated/prisma/client";
import { firstPage, pageMeta, type PageParams } from "@/lib/pagination";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listRefunds(status?: string, page: PageParams = firstPage()) {
  // Validated by the route; typed here so the filter is not an `as never` cast.
  const where = status ? { status: status as RefundStatus } : {};
  const [refunds, total, byStatus] = await Promise.all([
    prisma.refund.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
      include: {
        user: { select: { businessName: true, mobile: true } },
        order: { select: { orderNumber: true } },
      },
    }),
    prisma.refund.count({ where }),
    // Tab badges used to be counted in the browser off the full list. One
    // groupBy keeps them correct now that the list is a page.
    prisma.refund.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts: Record<string, number> = { All: 0 };
  for (const g of byStatus) {
    counts[g.status] = g._count._all;
    counts.All += g._count._all;
  }
  const rows = refunds.map((r) => ({
    id: r.id,
    orderNumber: r.order.orderNumber,
    customer: r.user.businessName,
    customerMobile: r.user.mobile,
    amount: Number(r.amount),
    status: r.status,
    reason: r.reason,
    createdAt: r.createdAt,
    processedAt: r.processedAt,
  }));
  return { refunds: rows, counts, ...pageMeta(rows.length, total, page) };
}

/**
 * Process a PENDING refund. APPROVE credits the wallet + marks CREDITED;
 * REJECT marks REJECTED (no wallet change).
 */
export async function processRefund(id: string, input: RefundProcessInput) {
  return prisma.$transaction(async (tx) => {
    const refund = await tx.refund.findUnique({ where: { id } });
    if (!refund) throw new HttpError(404, "Refund not found");

    // Atomically claim this refund out of its pending state so concurrent
    // approvals credit the wallet at most once.
    const nextStatus = input.action === "REJECT" ? "REJECTED" : "CREDITED";
    const claimed = await tx.refund.updateMany({
      where: { id, status: { in: ["PENDING", "PROCESSING"] } },
      data: { status: nextStatus, processedAt: new Date() },
    });
    if (claimed.count === 0) {
      throw new HttpError(422, `This refund is already ${refund.status}`);
    }

    if (input.action === "REJECT") {
      await tx.notification.create({
        data: {
          userId: refund.userId,
          type: "WALLET",
          title: "Refund declined",
          body: input.note ?? "Your refund request was declined.",
        },
      });
      return { id, status: "REJECTED" };
    }

    // APPROVE → credit wallet atomically (status already claimed above).
    const amount = round2(Number(refund.amount));
    const user = await tx.user.update({
      where: { id: refund.userId },
      data: { walletBalance: { increment: amount } },
    });
    const newBalance = Number(user.walletBalance);
    await tx.walletTransaction.create({
      data: {
        userId: refund.userId,
        type: "REFUND",
        amount,
        balanceAfter: newBalance,
        reference: refund.orderId,
        description: "Refund approved",
        relatedOrderId: refund.orderId,
      },
    });
    await tx.notification.create({
      data: {
        userId: refund.userId,
        type: "WALLET",
        title: "Refund credited",
        body: `₹${amount.toFixed(2)} has been credited to your wallet.`,
      },
    });
    return { id, status: "CREDITED", walletBalance: newBalance };
  });
}

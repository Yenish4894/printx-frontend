import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { RefundProcessInput } from "@/lib/dto/admin";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listRefunds(status?: string) {
  const refunds = await prisma.refund.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { businessName: true, mobile: true } },
      order: { select: { orderNumber: true } },
    },
  });
  return refunds.map((r) => ({
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

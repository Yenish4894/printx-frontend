import prisma from "@/lib/prisma";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Platform-wide wallet ledger + finance summary for the admin transactions page. */
export async function listAllTransactions(limit = 60) {
  const [txns, liability, credits, debits, refunds] = await Promise.all([
    prisma.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { businessName: true, mobile: true } } },
    }),
    prisma.user.aggregate({ _sum: { walletBalance: true }, where: { role: "CUSTOMER" } }),
    prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { type: "CREDIT" } }),
    prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { type: "DEBIT" } }),
    prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { type: "REFUND" } }),
  ]);

  return {
    summary: {
      walletLiability: round2(Number(liability._sum.walletBalance ?? 0)),
      topUps: round2(Number(credits._sum.amount ?? 0)),
      orderDebits: round2(Number(debits._sum.amount ?? 0)),
      refunds: round2(Number(refunds._sum.amount ?? 0)),
    },
    transactions: txns.map((t) => ({
      id: t.id,
      customer: t.user.businessName,
      customerMobile: t.user.mobile,
      type: t.type,
      amount: Number(t.amount),
      balanceAfter: Number(t.balanceAfter),
      reference: t.reference,
      description: t.description,
      createdAt: t.createdAt,
    })),
  };
}

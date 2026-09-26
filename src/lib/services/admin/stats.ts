import prisma from "@/lib/prisma";
import { IN_PRODUCTION_STATUSES, UNPAID_OR_VOID_STATUSES } from "@/lib/orderStatus";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Dashboard KPIs for the admin home. */
export async function getStats() {
  const [
    totalOrders,
    customers,
    products,
    revenueAgg,
    pendingRefunds,
    statusGroups,
    recentOrders,
    paymentsToVerify,
    pendingSignups,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    // Revenue is money received: an unpaid order is not revenue yet.
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { notIn: UNPAID_OR_VOID_STATUSES } },
    }),
    prisma.refund.count({ where: { status: "PENDING" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 8,
      include: { user: { select: { businessName: true } } },
    }),
    // Proofs uploaded and waiting on a person: the admin's first job of the day.
    prisma.payment.count({
      where: { status: "PENDING", proofUrl: { not: null }, order: { status: "PAYMENT_PENDING" } },
    }),
    // New businesses waiting for a yes/no before they can sign in at all.
    prisma.user.count({ where: { role: "CUSTOMER", approvalStatus: "PENDING" } }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups) byStatus[g.status] = g._count._all;

  // Orders in production (paid and not yet delivered). Unpaid orders are
  // counted separately: they are waiting on the customer, not on the press.
  const active = IN_PRODUCTION_STATUSES.reduce((s, st) => s + (byStatus[st] ?? 0), 0);

  return {
    totalOrders,
    activeOrders: active,
    customers,
    products,
    revenue: round2(Number(revenueAgg._sum.totalAmount ?? 0)),
    pendingRefunds,
    awaitingPayment: byStatus.PAYMENT_PENDING ?? 0,
    paymentsToVerify,
    pendingSignups,
    ordersByStatus: byStatus,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.businessName,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      placedAt: o.placedAt,
    })),
  };
}

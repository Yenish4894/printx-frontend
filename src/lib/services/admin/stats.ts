import prisma from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

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
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.refund.count({ where: { status: "PENDING" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 8,
      include: { user: { select: { businessName: true } } },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups) byStatus[g.status] = g._count._all;

  // Orders that need attention (placed → out for delivery, not terminal).
  const active = (["PLACED", "PAYMENT_CONFIRMED", "DESIGN_REVIEW", "PRINTING", "QUALITY_CHECK", "OUT_FOR_DELIVERY"] as OrderStatus[])
    .reduce((s, st) => s + (byStatus[st] ?? 0), 0);

  return {
    totalOrders,
    activeOrders: active,
    customers,
    products,
    revenue: round2(Number(revenueAgg._sum.totalAmount ?? 0)),
    pendingRefunds,
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

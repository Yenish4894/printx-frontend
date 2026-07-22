import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { WalletAdjustInput } from "@/lib/dto/admin";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return users.map((u) => ({
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
    walletBalance: Number(u.walletBalance),
    isActive: u.isActive,
    orderCount: u._count.orders,
    joinedAt: u.createdAt,
  }));
}

export async function getCustomer(id: string) {
  const u = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { placedAt: "desc" }, select: { id: true, orderNumber: true, status: true, totalAmount: true, placedAt: true } },
      walletTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");

  const spent = u.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  return {
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
    walletBalance: Number(u.walletBalance),
    isActive: u.isActive,
    joinedAt: u.createdAt,
    totalSpent: round2(spent),
    addresses: u.addresses.map((a) => ({
      id: a.id,
      label: a.label,
      name: a.name,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      phone: a.phone,
      isDefault: a.isDefault,
    })),
    orders: u.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      placedAt: o.placedAt,
    })),
    walletTransactions: u.walletTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      createdAt: t.createdAt,
    })),
  };
}

export async function setCustomerActive(id: string, isActive: boolean) {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");
  await prisma.user.update({ where: { id }, data: { isActive } });
  return { id, isActive };
}

/** Manual wallet correction by admin (credit if +, debit if −). */
export async function adjustCustomerWallet(id: string, input: WalletAdjustInput) {
  return prisma.$transaction(async (tx) => {
    const u = await tx.user.findUnique({ where: { id } });
    if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");
    const delta = round2(input.amount);

    // Atomic, guarded update — a debit can never drive the balance negative even
    // under concurrent adjustments/orders.
    let updated;
    if (delta >= 0) {
      updated = await tx.user.update({
        where: { id },
        data: { walletBalance: { increment: delta } },
      });
    } else {
      const res = await tx.user.updateMany({
        where: { id, walletBalance: { gte: -delta } },
        data: { walletBalance: { decrement: -delta } },
      });
      if (res.count === 0) throw new HttpError(422, "Adjustment would make the balance negative");
      updated = await tx.user.findUnique({ where: { id } });
    }
    const newBalance = Number(updated!.walletBalance);
    await tx.walletTransaction.create({
      data: {
        userId: id,
        type: delta >= 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(delta),
        balanceAfter: newBalance,
        description: input.note ?? "Manual adjustment by admin",
      },
    });
    return { id, walletBalance: newBalance };
  });
}

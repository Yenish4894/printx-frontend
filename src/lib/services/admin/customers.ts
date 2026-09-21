import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { Prisma } from "@/generated/prisma/client";
import { firstPage, pageMeta, type PageParams } from "@/lib/pagination";
import { UNPAID_OR_VOID_STATUSES } from "@/lib/orderStatus";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listCustomers(
  page: PageParams = firstPage(),
  q?: string,
  isActive?: boolean,
) {
  // Search and the active/inactive filter both run in the DB: applied in the
  // browser over a paginated list they would only ever cover the current page.
  const term = q?.trim();
  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(isActive === undefined ? {} : { isActive }),
    ...(term
      ? {
          OR: [
            { businessName: { contains: term, mode: "insensitive" as const } },
            { ownerName: { contains: term, mode: "insensitive" as const } },
            { email: { contains: term, mode: "insensitive" as const } },
            { mobile: { contains: term } },
          ],
        }
      : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
      // Explicit select: a bare findMany pulled passwordHash out of the DB for
      // a mapper that uses nine fields.
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        mobile: true,
        email: true,
        gstNumber: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  const rows = users.map((u) => ({
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
    isActive: u.isActive,
    orderCount: u._count.orders,
    joinedAt: u.createdAt,
  }));
  return { customers: rows, ...pageMeta(rows.length, total, page) };
}

export async function getCustomer(id: string) {
  // Orders are capped at the latest 20; total spend comes from an aggregate
  // rather than from summing every order ever placed in JS.
  const [u, spend] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { placedAt: "desc" },
          take: 20,
          select: { id: true, orderNumber: true, status: true, totalAmount: true, placedAt: true },
        },
      },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { userId: id, status: { notIn: UNPAID_OR_VOID_STATUSES } },
    }),
  ]);
  if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");

  const spent = Number(spend._sum.totalAmount ?? 0);

  return {
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
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
  };
}

export async function setCustomerActive(id: string, isActive: boolean) {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");
  await prisma.user.update({ where: { id }, data: { isActive } });
  return { id, isActive };
}

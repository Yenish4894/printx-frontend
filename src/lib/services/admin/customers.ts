import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { Prisma } from "@/generated/prisma/client";
import { firstPage, pageMeta, type PageParams } from "@/lib/pagination";
import { UNPAID_OR_VOID_STATUSES } from "@/lib/orderStatus";
import type { ApprovalStatus } from "@/lib/approval";
import type { SignupReviewInput } from "@/lib/dto/admin";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function listCustomers(
  page: PageParams = firstPage(),
  q?: string,
  isActive?: boolean,
  approval?: ApprovalStatus,
) {
  // Search and the active/inactive filter both run in the DB: applied in the
  // browser over a paginated list they would only ever cover the current page.
  const term = q?.trim();
  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(isActive === undefined ? {} : { isActive }),
    ...(approval ? { approvalStatus: approval } : {}),
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
  const [users, total, pendingApproval] = await Promise.all([
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
        approvalStatus: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
    // The badge on the "Pending approval" tab: how many applications are waiting,
    // regardless of which tab or search is showing.
    prisma.user.count({ where: { role: "CUSTOMER", approvalStatus: "PENDING" } }),
  ]);
  const rows = users.map((u) => ({
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
    isActive: u.isActive,
    approvalStatus: u.approvalStatus,
    orderCount: u._count.orders,
    joinedAt: u.createdAt,
  }));
  return { customers: rows, pendingApproval, ...pageMeta(rows.length, total, page) };
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
        _count: { select: { orders: true } },
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
    approvalStatus: u.approvalStatus,
    approvalRejectReason: u.approvalRejectReason,
    approvalReviewedAt: u.approvalReviewedAt,
    joinedAt: u.createdAt,
    totalSpent: round2(spent),
    // The real lifetime count, not the length of the capped "recent orders"
    // list below — those two used to be conflated, silently under-reporting
    // the order count for any customer past their most recent 20.
    orderCount: u._count.orders,
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

/**
 * Approve or reject a new signup.
 *
 * APPROVE works from PENDING, and from REJECTED (an admin can change their
 * mind); REJECT only from PENDING (an approved account that should be blocked
 * is deactivated instead). Both are claimed with a guarded updateMany so two
 * admins acting at once cannot approve and reject the same application.
 */
export async function reviewSignup(id: string, adminId: string, input: SignupReviewInput) {
  const approve = input.action === "APPROVE";
  const now = new Date();
  const claimed = await prisma.user.updateMany({
    where: {
      id,
      role: "CUSTOMER",
      approvalStatus: approve ? { in: ["PENDING", "REJECTED"] } : "PENDING",
    },
    data: approve
      ? { approvalStatus: "APPROVED", approvalReviewedAt: now, approvalReviewedById: adminId, approvalRejectReason: null }
      : { approvalStatus: "REJECTED", approvalReviewedAt: now, approvalReviewedById: adminId, approvalRejectReason: input.reason! },
  });
  if (claimed.count === 0) {
    const u = await prisma.user.findUnique({ where: { id }, select: { role: true, approvalStatus: true } });
    if (!u || u.role !== "CUSTOMER") throw new HttpError(404, "Customer not found");
    throw new HttpError(
      422,
      u.approvalStatus === "APPROVED"
        ? approve
          ? "This account is already approved."
          : "This account is already approved. Deactivate it instead if you want to block it."
        : "This application was already rejected.",
    );
  }
  // Approval and the on/off switch are separate: approving an account an admin had
  // also switched off doesn't let them in, and the admin should be told that
  // rather than "they can sign in now".
  const after = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  return {
    id,
    approvalStatus: approve ? ("APPROVED" as const) : ("REJECTED" as const),
    isActive: after?.isActive ?? true,
  };
}

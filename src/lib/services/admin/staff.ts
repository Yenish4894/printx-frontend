import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { hashPassword } from "@/lib/auth";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/dto/settings";

const publicStaff = (u: {
  id: string;
  ownerName: string;
  businessName: string;
  mobile: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}) => ({
  id: u.id,
  name: u.ownerName,
  businessName: u.businessName,
  mobile: u.mobile,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
});

export async function listStaff() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });
  const stats = {
    total: users.length,
    superAdmins: users.filter((u) => u.role === "SUPER_ADMIN").length,
    active: users.filter((u) => u.isActive).length,
  };
  return { staff: users.map(publicStaff), stats };
}

export async function createStaff(input: CreateStaffInput) {
  const exists = await prisma.user.findUnique({ where: { mobile: input.mobile } });
  if (exists) throw new HttpError(422, "A user with this mobile already exists");
  const u = await prisma.user.create({
    data: {
      ownerName: input.ownerName,
      businessName: input.businessName ?? "Bhagini Graphics",
      mobile: input.mobile,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
  });
  return publicStaff(u);
}

export async function updateStaff(
  id: string,
  actingUserId: string,
  input: UpdateStaffInput,
) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
    throw new HttpError(404, "Admin user not found");
  }
  // Guard: don't let an admin lock themselves out.
  if (id === actingUserId && input.isActive === false) {
    throw new HttpError(422, "You cannot deactivate your own account");
  }
  const u = await prisma.user.update({
    where: { id },
    data: {
      role: input.role,
      isActive: input.isActive,
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    },
  });
  return publicStaff(u);
}

export async function deleteStaff(id: string, actingUserId: string) {
  if (id === actingUserId) throw new HttpError(422, "You cannot remove your own account");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
    throw new HttpError(404, "Admin user not found");
  }
  // Preserve history: deactivate rather than hard-delete if they own records.
  const orders = await prisma.order.count({ where: { userId: id } });
  if (orders > 0) {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    return { id, deactivated: true };
  }
  await prisma.user.delete({ where: { id } });
  return { id, deactivated: false };
}

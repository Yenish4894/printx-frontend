import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/auth";

/**
 * Change the signed-in user's own password. A wrong current password is a 422,
 * never a 401: any 401 from a protected route makes the browser sign the user
 * out, and a typo is not a dead session.
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw new HttpError(404, "Account not found");
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new HttpError(422, "Your current password is incorrect");
  }
  // Whole seconds: session tokens carry a seconds-resolution issue time, and the
  // session re-issued right after this must not look older than the change.
  const changedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: changedAt },
  });
}

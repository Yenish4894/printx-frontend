import type { User } from "@/generated/prisma/client";

/** Shape of the user returned to the client (no passwordHash; Decimal → number). */
export function publicUser(u: User) {
  return {
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    mobile: u.mobile,
    email: u.email,
    gstNumber: u.gstNumber,
    role: u.role,
    walletBalance: Number(u.walletBalance),
  };
}

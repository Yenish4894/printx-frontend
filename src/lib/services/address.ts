import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { AddressInput } from "@/lib/dto/address";

export function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(userId: string, data: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = data.isDefault || count === 0;

  if (makeDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: {
      userId,
      label: data.label,
      name: data.name,
      line1: data.line1,
      line2: data.line2 ?? null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      isDefault: makeDefault,
    },
  });
}

/**
 * Delete one of the user's addresses.
 *
 * Safe against order history: an Order stores its own `shippingSnapshot` at
 * checkout rather than pointing at this row, so removing an address never
 * rewrites where a past order went.
 */
export async function deleteAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new HttpError(404, "Address not found");
  await prisma.address.delete({ where: { id } });

  // Deleting the default would leave the account with none marked default, so
  // promote the oldest remaining one.
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
  return { success: true };
}

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

export async function deleteAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new HttpError(404, "Address not found");
  await prisma.address.delete({ where: { id } });
  return { success: true };
}

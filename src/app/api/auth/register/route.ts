import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, handleError, HttpError } from "@/lib/http";
import { registerSchema } from "@/lib/dto/auth";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { mobile: data.mobile },
    });
    if (existing) {
      throw new HttpError(
        409,
        "An account with this mobile number already exists",
      );
    }

    const passwordHash = await hashPassword(data.password);

    // The check above is advisory: two simultaneous signups both pass it and one
    // hits the unique index. Catch that so it reads as a conflict, not a 500.
    let user;
    try {
      user = await prisma.user.create({
        data: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          mobile: data.mobile,
          email: data.email,
          gstNumber: data.gstNumber ? data.gstNumber : null,
          passwordHash,
          // provision cart + wallet settings on signup
          cart: { create: {} },
          walletSettings: { create: {} },
        },
      });
    } catch (e) {
      if ((e as { code?: string })?.code === "P2002") {
        throw new HttpError(409, "An account with this mobile number already exists");
      }
      throw e;
    }

    await createSession({ id: user.id, mobile: user.mobile, role: user.role });
    return ok({ user: publicUser(user) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

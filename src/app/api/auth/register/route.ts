import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { ok, handleError, HttpError } from "@/lib/http";
import { registerSchema } from "@/lib/dto/auth";
import { applicationReceived } from "@/lib/approval";

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
        "An account with this mobile number already exists. If you applied earlier, sign in to see where your application stands.",
      );
    }

    const passwordHash = await hashPassword(data.password);

    // The check above is advisory: two simultaneous signups both pass it and one
    // hits the unique index. Catch that so it reads as a conflict, not a 500.
    try {
      await prisma.user.create({
        data: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          mobile: data.mobile,
          email: data.email,
          gstNumber: data.gstNumber ? data.gstNumber : null,
          passwordHash,
          // Nobody gets in on signup alone: an admin approves the business first.
          approvalStatus: "PENDING",
          cart: { create: {} },
        },
      });
    } catch (e) {
      if ((e as { code?: string })?.code === "P2002") {
        throw new HttpError(409, "An account with this mobile number already exists. If you applied earlier, sign in to see where your application stands.");
      }
      throw e;
    }

    // No session: an applicant has nothing to sign in to until they're approved.
    return ok({ pending: true, message: applicationReceived() }, 201);
  } catch (err) {
    return handleError(err);
  }
}

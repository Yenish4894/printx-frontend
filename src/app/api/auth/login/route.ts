import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, handleError, HttpError } from "@/lib/http";
import { loginSchema } from "@/lib/dto/auth";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { mobile: data.mobile },
    });
    const valid =
      user && user.isActive && (await verifyPassword(data.password, user.passwordHash));
    if (!user || !valid) {
      throw new HttpError(401, "Invalid mobile number or password");
    }

    await createSession({ id: user.id, mobile: user.mobile, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return ok({ user: publicUser(user) });
  } catch (err) {
    return handleError(err);
  }
}

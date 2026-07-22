import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/http";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ user: null });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    return ok({ user: user ? publicUser(user) : null });
  } catch (err) {
    return handleError(err);
  }
}

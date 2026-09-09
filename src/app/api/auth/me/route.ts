import prisma from "@/lib/prisma";
import { getSession, clearSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/http";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ user: null });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    // A deactivated (or deleted) account must read as logged OUT here. Reporting
    // it as signed in left the UI showing a session while every other endpoint
    // returned 401, so the user saw errors everywhere instead of a login screen.
    if (!user || !user.isActive) {
      await clearSession();
      return ok({ user: null });
    }
    return ok({ user: publicUser(user) });
  } catch (err) {
    return handleError(err);
  }
}

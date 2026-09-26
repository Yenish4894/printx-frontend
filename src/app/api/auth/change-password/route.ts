import { requireUser, createSession } from "@/lib/auth";
import { changePassword } from "@/lib/services/account";
import { changePasswordSchema } from "@/lib/dto/auth";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

/** The signed-in user changes their own password; other devices are signed out. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
    await changePassword(user.id, currentPassword, newPassword);
    // Every older session is now revoked, including this browser's, so hand it a fresh one.
    await createSession({ id: user.id, mobile: user.mobile, role: user.role });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

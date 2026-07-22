import { clearSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSession();
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

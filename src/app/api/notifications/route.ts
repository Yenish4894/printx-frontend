import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/services/notifications";
import { ok, handleError } from "@/lib/http";
import { pageParams } from "@/lib/pagination";

export const runtime = "nodejs";

/** The signed-in user's own notifications (customers and staff alike). */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    return ok(await listNotifications(user.id, pageParams(req.url, 15)));
  } catch (err) {
    return handleError(err);
  }
}

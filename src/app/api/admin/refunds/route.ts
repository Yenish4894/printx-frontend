import { requireAdmin } from "@/lib/auth";
import { listRefunds } from "@/lib/services/admin/refunds";
import { ok, handleError, HttpError } from "@/lib/http";
import { REFUND_STATUS } from "@/lib/orderStatus";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") ?? undefined;
    if (status && !Object.hasOwn(REFUND_STATUS, status)) {
      throw new HttpError(400, `Unknown refund status "${status}"`);
    }
    return ok({ refunds: await listRefunds(status) });
  } catch (err) {
    return handleError(err);
  }
}

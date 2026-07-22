import { requireAdmin } from "@/lib/auth";
import { listRefunds } from "@/lib/services/admin/refunds";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") ?? undefined;
    return ok({ refunds: await listRefunds(status) });
  } catch (err) {
    return handleError(err);
  }
}

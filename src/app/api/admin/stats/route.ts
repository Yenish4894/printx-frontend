import { requireAdmin } from "@/lib/auth";
import { getStats } from "@/lib/services/admin/stats";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok({ stats: await getStats() });
  } catch (err) {
    return handleError(err);
  }
}

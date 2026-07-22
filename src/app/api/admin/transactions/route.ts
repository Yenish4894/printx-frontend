import { requireAdmin } from "@/lib/auth";
import { listAllTransactions } from "@/lib/services/admin/finance";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAllTransactions());
  } catch (err) {
    return handleError(err);
  }
}

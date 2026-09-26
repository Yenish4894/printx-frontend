import { requireAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/services/admin/customers";
import { ok, handleError } from "@/lib/http";
import { pageParams } from "@/lib/pagination";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") ?? undefined;
    // Only the two literal values filter; anything else means "no filter",
    // rather than silently collapsing to inactive-only.
    const active = sp.get("active");
    const isActive = active === "true" ? true : active === "false" ? false : undefined;
    const a = sp.get("approval");
    const approval = a === "PENDING" || a === "APPROVED" || a === "REJECTED" ? a : undefined;
    return ok(await listCustomers(pageParams(req.url), q, isActive, approval));
  } catch (err) {
    return handleError(err);
  }
}

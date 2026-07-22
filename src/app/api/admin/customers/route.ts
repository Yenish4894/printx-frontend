import { requireAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/services/admin/customers";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok({ customers: await listCustomers() });
  } catch (err) {
    return handleError(err);
  }
}

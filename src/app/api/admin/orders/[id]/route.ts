import { requireAdmin } from "@/lib/auth";
import { getAdminOrder } from "@/lib/services/admin/orders";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ order: await getAdminOrder(id) });
  } catch (err) {
    return handleError(err);
  }
}

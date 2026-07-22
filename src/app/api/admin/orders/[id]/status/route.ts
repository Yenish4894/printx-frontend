import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/services/admin/orders";
import { orderStatusSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = orderStatusSchema.parse(await req.json());
    return ok({ order: await updateOrderStatus(id, input) });
  } catch (err) {
    return handleError(err);
  }
}

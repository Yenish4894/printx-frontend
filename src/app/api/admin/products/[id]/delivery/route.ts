import { requireAdmin } from "@/lib/auth";
import { setDeliverySpeeds } from "@/lib/services/admin/catalog";
import { deliverySchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = deliverySchema.parse(await req.json());
    return ok(await setDeliverySpeeds(id, input));
  } catch (err) {
    return handleError(err);
  }
}

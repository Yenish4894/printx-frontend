import { requireAdmin } from "@/lib/auth";
import { reviewOrderItemFile } from "@/lib/services/admin/orders";
import { fileReviewSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    await requireAdmin();
    const { id, itemId } = await params;
    const input = fileReviewSchema.parse(await req.json());
    return ok({ item: await reviewOrderItemFile(id, itemId, input) });
  } catch (err) {
    return handleError(err);
  }
}

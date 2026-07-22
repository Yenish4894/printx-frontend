import { requireAdmin } from "@/lib/auth";
import { processRefund } from "@/lib/services/admin/refunds";
import { refundProcessSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = refundProcessSchema.parse(await req.json());
    return ok({ refund: await processRefund(id, input) });
  } catch (err) {
    return handleError(err);
  }
}

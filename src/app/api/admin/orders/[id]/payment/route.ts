import { requireAdmin } from "@/lib/auth";
import { reviewPayment } from "@/lib/services/admin/orders";
import { paymentReviewSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

/** Admin approves (order -> PLACED) or rejects (customer re-uploads) a payment proof. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const input = paymentReviewSchema.parse(await req.json());
    return ok({ result: await reviewPayment(id, admin.id, input) });
  } catch (err) {
    return handleError(err);
  }
}

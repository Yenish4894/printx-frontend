import { requireAdmin } from "@/lib/auth";
import { reviewSignup } from "@/lib/services/admin/customers";
import { signupReviewSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

/** Admin approves a new signup (they can sign in) or rejects it with a reason. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const input = signupReviewSchema.parse(await req.json());
    return ok({ result: await reviewSignup(id, admin.id, input) });
  } catch (err) {
    return handleError(err);
  }
}

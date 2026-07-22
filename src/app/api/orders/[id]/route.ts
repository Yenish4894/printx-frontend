import { requireUser } from "@/lib/auth";
import { getOrder } from "@/lib/services/order";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok({ order: await getOrder(user.id, id) });
  } catch (err) {
    return handleError(err);
  }
}

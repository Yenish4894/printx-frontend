import { requireUser } from "@/lib/auth";
import { cancelOrder } from "@/lib/services/order";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = typeof body?.reason === "string" ? body.reason : undefined;
    } catch {
      // no body is fine
    }
    return ok({ order: await cancelOrder(user.id, id, reason) });
  } catch (err) {
    return handleError(err);
  }
}

import { requireUser } from "@/lib/auth";
import { createTopUpOrder } from "@/lib/services/wallet";
import { topUpSchema } from "@/lib/dto/wallet";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { amount } = topUpSchema.parse(await req.json());
    return ok(await createTopUpOrder(user.id, amount), 201);
  } catch (err) {
    return handleError(err);
  }
}

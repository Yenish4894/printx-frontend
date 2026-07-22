import { requireUser } from "@/lib/auth";
import { verifyTopUp } from "@/lib/services/wallet";
import { verifyTopUpSchema } from "@/lib/dto/wallet";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = verifyTopUpSchema.parse(await req.json());
    return ok({ wallet: await verifyTopUp(user.id, input) });
  } catch (err) {
    return handleError(err);
  }
}

import { requireUser } from "@/lib/auth";
import { listTransactions } from "@/lib/services/wallet";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ transactions: await listTransactions(user.id) });
  } catch (err) {
    return handleError(err);
  }
}

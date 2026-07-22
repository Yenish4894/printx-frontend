import { requireAdmin } from "@/lib/auth";
import { adjustCustomerWallet } from "@/lib/services/admin/customers";
import { walletAdjustSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = walletAdjustSchema.parse(await req.json());
    return ok({ wallet: await adjustCustomerWallet(id, input) });
  } catch (err) {
    return handleError(err);
  }
}

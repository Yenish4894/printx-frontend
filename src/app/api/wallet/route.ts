import { requireUser } from "@/lib/auth";
import { getWallet, updateWalletSettings } from "@/lib/services/wallet";
import { walletSettingsSchema } from "@/lib/dto/wallet";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await getWallet(user.id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const input = walletSettingsSchema.parse(await req.json());
    return ok({ settings: await updateWalletSettings(user.id, input) });
  } catch (err) {
    return handleError(err);
  }
}

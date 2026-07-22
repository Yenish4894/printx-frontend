import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/services/settings";
import { settingsSchema } from "@/lib/dto/settings";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok({ settings: await getSettings() });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const input = settingsSchema.parse(await req.json());
    return ok({ settings: await updateSettings(input) });
  } catch (err) {
    return handleError(err);
  }
}

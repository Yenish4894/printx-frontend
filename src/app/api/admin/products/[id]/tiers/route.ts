import { requireAdmin } from "@/lib/auth";
import { setQuantityTiers } from "@/lib/services/admin/catalog";
import { tiersSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = tiersSchema.parse(await req.json());
    return ok(await setQuantityTiers(id, input));
  } catch (err) {
    return handleError(err);
  }
}

import { requireAdmin } from "@/lib/auth";
import { updateSpecOption, deleteSpecOption } from "@/lib/services/admin/catalog";
import { specOptionSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = specOptionSchema.parse(await req.json());
    return ok({ option: await updateSpecOption(id, input) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok(await deleteSpecOption(id));
  } catch (err) {
    return handleError(err);
  }
}

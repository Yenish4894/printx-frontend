import { requireAdmin } from "@/lib/auth";
import { updateSpecGroup, deleteSpecGroup } from "@/lib/services/admin/catalog";
import { specGroupSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = specGroupSchema.parse(await req.json());
    return ok({ specGroup: await updateSpecGroup(id, input) });
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
    return ok(await deleteSpecGroup(id));
  } catch (err) {
    return handleError(err);
  }
}

import { requireSuperAdmin } from "@/lib/auth";
import { updateStaff, deleteStaff } from "@/lib/services/admin/staff";
import { updateStaffSchema } from "@/lib/dto/settings";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const me = await requireSuperAdmin();
    const { id } = await params;
    const input = updateStaffSchema.parse(await req.json());
    return ok({ staff: await updateStaff(id, me.id, input) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const me = await requireSuperAdmin();
    const { id } = await params;
    return ok(await deleteStaff(id, me.id));
  } catch (err) {
    return handleError(err);
  }
}

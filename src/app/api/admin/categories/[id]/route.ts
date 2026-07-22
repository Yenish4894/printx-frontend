import { requireAdmin } from "@/lib/auth";
import { updateCategory, deleteCategory } from "@/lib/services/admin/catalog";
import { categorySchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = categorySchema.parse(await req.json());
    return ok({ category: await updateCategory(id, input) });
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
    return ok(await deleteCategory(id));
  } catch (err) {
    return handleError(err);
  }
}

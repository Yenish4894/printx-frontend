import { requireAdmin } from "@/lib/auth";
import { getAdminProduct, updateProduct, deleteProduct } from "@/lib/services/admin/catalog";
import { updateProductSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ product: await getAdminProduct(id) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = updateProductSchema.parse(await req.json());
    return ok({ product: await updateProduct(id, input) });
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
    return ok(await deleteProduct(id));
  } catch (err) {
    return handleError(err);
  }
}

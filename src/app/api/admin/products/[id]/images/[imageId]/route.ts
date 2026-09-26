import { requireAdmin } from "@/lib/auth";
import { ok, handleError, HttpError } from "@/lib/http";
import { makePrimaryImage, removeProductImage } from "@/lib/services/admin/productImages";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; imageId: string }> };

/** Make this the primary image (the one the catalogue shows). */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id, imageId } = await params;
    const body = (await req.json().catch(() => null)) as { primary?: unknown } | null;
    if (body?.primary !== true) throw new HttpError(422, "Nothing to update");
    return ok({ images: await makePrimaryImage(id, imageId) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id, imageId } = await params;
    return ok(await removeProductImage(id, imageId));
  } catch (err) {
    return handleError(err);
  }
}

import { requireAdmin } from "@/lib/auth";
import { getMatrix, setMatrix } from "@/lib/services/admin/catalog";
import { matrixSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ matrix: await getMatrix(id) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = matrixSchema.parse(await req.json());
    return ok(await setMatrix(id, input));
  } catch (err) {
    return handleError(err);
  }
}

import { requireAdmin } from "@/lib/auth";
import { createSpecGroup } from "@/lib/services/admin/catalog";
import { specGroupSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = specGroupSchema.parse(await req.json());
    return ok({ specGroup: await createSpecGroup(id, input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

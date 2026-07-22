import { requireAdmin } from "@/lib/auth";
import { createSpecOption } from "@/lib/services/admin/catalog";
import { specOptionSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = specOptionSchema.parse(await req.json());
    return ok({ option: await createSpecOption(id, input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

import { requireAdmin } from "@/lib/auth";
import { updateRule, deleteRule } from "@/lib/services/admin/rules";
import { visibilityRuleSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = visibilityRuleSchema.parse(await req.json());
    return ok({ rule: await updateRule(id, input) });
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
    return ok(await deleteRule(id));
  } catch (err) {
    return handleError(err);
  }
}

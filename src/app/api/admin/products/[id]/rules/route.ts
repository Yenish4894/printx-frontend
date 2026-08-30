import { requireAdmin } from "@/lib/auth";
import { listRules, createRule } from "@/lib/services/admin/rules";
import { visibilityRuleSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ rules: await listRules(id) });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = visibilityRuleSchema.parse(await req.json());
    return ok({ rule: await createRule(id, input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

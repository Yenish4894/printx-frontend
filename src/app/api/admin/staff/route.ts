import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { listStaff, createStaff } from "@/lib/services/admin/staff";
import { createStaffSchema } from "@/lib/dto/settings";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listStaff());
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const input = createStaffSchema.parse(await req.json());
    return ok({ staff: await createStaff(input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

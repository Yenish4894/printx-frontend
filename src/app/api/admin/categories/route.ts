import { requireAdmin } from "@/lib/auth";
import { listCategories, createCategory } from "@/lib/services/admin/catalog";
import { categorySchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok({ categories: await listCategories() });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const input = categorySchema.parse(await req.json());
    return ok({ category: await createCategory(input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

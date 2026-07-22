import { requireAdmin } from "@/lib/auth";
import { listAdminProducts, createProduct } from "@/lib/services/admin/catalog";
import { createProductSchema } from "@/lib/dto/admin";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return ok({ products: await listAdminProducts() });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const input = createProductSchema.parse(await req.json());
    return ok({ product: await createProduct(input) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

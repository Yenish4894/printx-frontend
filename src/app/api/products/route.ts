import { listProducts } from "@/lib/services/catalog";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const category =
      new URL(req.url).searchParams.get("category") ?? undefined;
    const products = await listProducts(category);
    return ok({ products });
  } catch (err) {
    return handleError(err);
  }
}

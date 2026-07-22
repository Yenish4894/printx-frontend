import { getProductBySlug } from "@/lib/services/catalog";
import { ok, handleError, HttpError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) throw new HttpError(404, "Product not found");
    return ok({ product });
  } catch (err) {
    return handleError(err);
  }
}

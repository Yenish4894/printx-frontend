import { listProducts } from "@/lib/services/catalog";
import { ok, handleError } from "@/lib/http";
import { pageParams } from "@/lib/pagination";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const category =
      new URL(req.url).searchParams.get("category") ?? undefined;
    return ok(await listProducts(category, pageParams(req.url)));
  } catch (err) {
    return handleError(err);
  }
}

import { requireAdmin } from "@/lib/auth";
import { listAllOrders } from "@/lib/services/admin/orders";
import { ok, handleError, HttpError } from "@/lib/http";
import { pageParams } from "@/lib/pagination";
import { ORDER_STATUS } from "@/lib/orderStatus";
import type { OrderStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    // Cast-and-hope sent unknown values straight into a Prisma enum filter,
    // which throws and surfaces as a 500. Reject them as bad input instead.
    const status = new URL(req.url).searchParams.get("status");
    if (status && !Object.hasOwn(ORDER_STATUS, status)) {
      throw new HttpError(400, `Unknown order status "${status}"`);
    }
    const q = new URL(req.url).searchParams.get("q") ?? undefined;
    return ok(await listAllOrders((status as OrderStatus) ?? undefined, pageParams(req.url), q));
  } catch (err) {
    return handleError(err);
  }
}

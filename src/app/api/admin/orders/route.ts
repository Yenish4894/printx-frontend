import { requireAdmin } from "@/lib/auth";
import { listAllOrders } from "@/lib/services/admin/orders";
import { ok, handleError } from "@/lib/http";
import type { OrderStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") as OrderStatus | null;
    return ok({ orders: await listAllOrders(status ?? undefined) });
  } catch (err) {
    return handleError(err);
  }
}

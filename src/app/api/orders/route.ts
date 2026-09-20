import { requireUser } from "@/lib/auth";
import { placeOrder, listOrders, type OrderBucket } from "@/lib/services/order";
import { placeOrderSchema } from "@/lib/dto/order";
import { ok, handleError } from "@/lib/http";
import { pageParams } from "@/lib/pagination";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const sp = new URL(req.url).searchParams;
    const raw = sp.get("bucket");
    const bucket: OrderBucket =
      raw === "active" || raw === "completed" || raw === "cancelled" ? raw : "all";
    return ok(await listOrders(user.id, pageParams(req.url), bucket, sp.get("q") ?? undefined));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { addressId, notes } = placeOrderSchema.parse(await req.json());
    const order = await placeOrder(user.id, addressId, notes);
    return ok({ order }, 201);
  } catch (err) {
    return handleError(err);
  }
}

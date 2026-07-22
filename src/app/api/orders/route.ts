import { requireUser } from "@/lib/auth";
import { placeOrder, listOrders } from "@/lib/services/order";
import { placeOrderSchema } from "@/lib/dto/order";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ orders: await listOrders(user.id) });
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

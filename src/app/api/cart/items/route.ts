import { requireUser } from "@/lib/auth";
import { addCartItem } from "@/lib/services/cart";
import { addCartItemSchema } from "@/lib/dto/cart";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = addCartItemSchema.parse(await req.json());
    const cart = await addCartItem(user.id, input);
    return ok(cart, 201);
  } catch (err) {
    return handleError(err);
  }
}

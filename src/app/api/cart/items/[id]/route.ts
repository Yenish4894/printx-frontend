import { requireUser } from "@/lib/auth";
import {
  updateCartItemQuantity,
  removeCartItem,
} from "@/lib/services/cart";
import { updateCartItemSchema } from "@/lib/dto/cart";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { quantity } = updateCartItemSchema.parse(await req.json());
    return ok(await updateCartItemQuantity(user.id, id, quantity));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await removeCartItem(user.id, id));
  } catch (err) {
    return handleError(err);
  }
}

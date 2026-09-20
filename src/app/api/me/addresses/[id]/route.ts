import { requireUser } from "@/lib/auth";
import { deleteAddress } from "@/lib/services/address";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

/**
 * Remove one of the caller's saved addresses. The service scopes the lookup to
 * the session's user, so an id belonging to someone else reads as 404 rather
 * than deleting their address.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await deleteAddress(user.id, id));
  } catch (err) {
    return handleError(err);
  }
}

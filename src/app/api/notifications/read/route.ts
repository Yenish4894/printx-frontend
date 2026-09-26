import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { markRead } from "@/lib/services/notifications";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({ id: z.string().min(1).max(64).optional() });

/** Mark one notification read (`{ id }`), or all of the caller's when no id is sent. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { id } = bodySchema.parse(await req.json().catch(() => ({})));
    return ok(await markRead(user.id, id));
  } catch (err) {
    return handleError(err);
  }
}

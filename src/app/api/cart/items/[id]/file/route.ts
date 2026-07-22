import { requireUser } from "@/lib/auth";
import { setCartItemFile } from "@/lib/services/cart";
import { saveUpload } from "@/lib/storage";
import { ok, fail, handleError, HttpError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "No file provided");
    let stored;
    try {
      stored = await saveUpload(file);
    } catch (e) {
      return fail(422, e instanceof Error ? e.message : "Upload failed");
    }
    return ok({ cart: await setCartItemFile(user.id, id, stored) });
  } catch (err) {
    return handleError(err);
  }
}

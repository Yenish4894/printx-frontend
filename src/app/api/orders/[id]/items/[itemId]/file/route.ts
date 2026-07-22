import { requireUser } from "@/lib/auth";
import { setOrderItemFile } from "@/lib/services/order";
import { saveUpload } from "@/lib/storage";
import { ok, fail, handleError, HttpError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, itemId } = await params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "No file provided");
    let stored;
    try {
      stored = await saveUpload(file);
    } catch (e) {
      return fail(422, e instanceof Error ? e.message : "Upload failed");
    }
    return ok({ order: await setOrderItemFile(user.id, id, itemId, stored) });
  } catch (err) {
    return handleError(err);
  }
}

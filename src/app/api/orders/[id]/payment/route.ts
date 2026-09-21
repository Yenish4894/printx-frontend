import { requireUser } from "@/lib/auth";
import { submitPaymentProof, proofTarget } from "@/lib/services/order";
import { saveUpload } from "@/lib/storage";
import { PROOF_REFERENCE_MAX, proofFileProblem } from "@/lib/paymentRules";
import { ok, fail, handleError, HttpError } from "@/lib/http";

export const runtime = "nodejs";

/** Customer uploads proof of bank transfer (screenshot or PDF) for their order. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "Choose the payment screenshot to upload");
    const problem = proofFileProblem(file);
    if (problem) throw new HttpError(422, problem);

    const reference = form.get("reference");
    if (typeof reference === "string" && reference.trim().length > PROOF_REFERENCE_MAX) {
      throw new HttpError(422, "Transaction reference is too long");
    }

    // Ownership and status first: a request that can't succeed must not store a file.
    await proofTarget(user.id, id);

    let stored;
    try {
      stored = await saveUpload(file);
    } catch (e) {
      return fail(422, e instanceof Error ? e.message : "Upload failed");
    }
    const order = await submitPaymentProof(
      user.id,
      id,
      stored,
      typeof reference === "string" ? reference : undefined,
    );
    return ok({ order });
  } catch (err) {
    return handleError(err);
  }
}

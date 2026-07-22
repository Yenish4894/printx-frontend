import { requireUser } from "@/lib/auth";
import { readUpload } from "@/lib/storage";
import { fail, handleError } from "@/lib/http";
import path from "node:path";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".psd": "image/vnd.adobe.photoshop",
  ".ai": "application/postscript",
  ".eps": "application/postscript",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    // Auth required — uploads are private artwork. (Ownership check TODO once
    // files carry an owner index; keys are unguessable UUIDs for now.)
    await requireUser();
    const { key } = await params;
    const ext = path.extname(key).toLowerCase();
    const buf = await readUpload(key);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const e = err as { code?: string; name?: string; $metadata?: { httpStatusCode?: number } };
    const notFound =
      e?.code === "ENOENT" || e?.name === "NoSuchKey" || e?.$metadata?.httpStatusCode === 404;
    if (notFound) return fail(404, "File not found");
    return handleError(err);
  }
}

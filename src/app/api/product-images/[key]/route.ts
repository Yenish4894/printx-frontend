import path from "node:path";
import prisma from "@/lib/prisma";
import { readUpload } from "@/lib/storage";
import { fail, handleError } from "@/lib/http";
import { IMAGE_EXT_TYPES, productImageKey, productImageUrlForKey } from "@/lib/productImages";

export const runtime = "nodejs";

/**
 * Public: catalogue photos have to load for logged-out visitors on the
 * marketing page, unlike /api/files, which is owner/admin only.
 *
 * It only ever serves a file that a ProductImage row points at, so it cannot be
 * used to fetch a customer's artwork or a payment screenshot by guessing a key,
 * and only formats that are safe to show inline.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const url = productImageUrlForKey(key);
    if (productImageKey(url) !== key) return fail(404, "Not found");
    const type = IMAGE_EXT_TYPES[path.extname(key).toLowerCase()];
    if (!type) return fail(404, "Not found");

    const row = await prisma.productImage.findFirst({ where: { url }, select: { id: true } });
    if (!row) return fail(404, "Not found");

    let buf: Uint8Array;
    try {
      buf = await readUpload(key);
    } catch {
      return fail(404, "Not found");
    }
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        // The key is a fresh random name per upload, so a given key never changes.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

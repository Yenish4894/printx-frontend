import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { readUpload } from "@/lib/storage";
import { fail, handleError } from "@/lib/http";
import path from "node:path";

export const runtime = "nodejs";

// Only the formats saveUpload() accepts are ever served back, and each is
// served with its OWN type. Anything unrecognised is forced to a download
// rather than rendered, so a mislabelled upload can never execute in the
// viewer's origin.
const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".psd": "image/vnd.adobe.photoshop",
  ".ai": "application/postscript",
  ".eps": "application/postscript",
};

/**
 * Uploaded artwork is private customer property. Being logged in is NOT enough:
 * the key must belong to a cart or order line owned by the caller. Admins may
 * read any file (they review artwork for production).
 *
 * Returns 404 rather than 403 for someone else's file so the endpoint cannot be
 * used to probe which keys exist.
 */
async function canRead(userId: string, isAdmin: boolean, key: string) {
  if (isAdmin) return true;
  const url = `/api/files/${key}`;
  const [cartItem, orderItem] = await Promise.all([
    prisma.cartItem.findFirst({
      where: { fileUrl: url, cart: { userId } },
      select: { id: true },
    }),
    prisma.orderItem.findFirst({
      where: { fileUrl: url, order: { userId } },
      select: { id: true },
    }),
  ]);
  return !!(cartItem || orderItem);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const user = await requireUser();
    const { key } = await params;

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!(await canRead(user.id, isAdmin, key))) {
      return fail(404, "File not found");
    }

    const ext = path.extname(key).toLowerCase();
    const type = TYPES[ext];
    const buf = await readUpload(key);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type ?? "application/octet-stream",
        ...(type ? {} : { "Content-Disposition": "attachment" }),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
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

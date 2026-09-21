// File storage seam. Public API (saveUpload / readUpload) never changes.
// - On Cloudflare Workers: uses the R2 bucket bound as `UPLOADS` (R2 has a
//   free tier). This is the native binding — NO aws-sdk — which keeps the
//   Worker bundle small enough for the free plan.
// - In local Node dev: falls back to disk under ./uploads (not persistent on
//   serverless, dev-only).
// To enable in production: add the r2_buckets binding in wrangler.jsonc and
// create the bucket (`wrangler r2 bucket create printx-uploads`).
import { randomUUID } from "node:crypto";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp", // phone screenshots (payment proof)
  "image/vnd.adobe.photoshop", // .psd
  "application/postscript", // .ai / .eps
  "application/illustrator",
  "application/octet-stream", // some browsers send this for .ai/.cdr
]);
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

// Minimal shape of the R2 binding we rely on (avoids a hard dependency on
// @cloudflare/workers-types just for two methods).
interface R2Like {
  put(key: string, value: Uint8Array, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
}

/** The bound R2 bucket, or undefined when there is none. */
async function r2(): Promise<R2Like | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as unknown as { UPLOADS?: R2Like };
    return env.UPLOADS;
  } catch {
    return undefined; // no Cloudflare context at all (plain Node / seed)
  }
}

const NO_BUCKET =
  "File uploads are not configured on the server. " +
  "Create the bucket (wrangler r2 bucket create printx-uploads) and uncomment " +
  "the r2_buckets binding in wrangler.jsonc.";

/**
 * Wrap the local-disk fallback so a genuinely missing backend reports itself.
 *
 * Do NOT try to detect "are we on Workers" — `getCloudflareContext()` also
 * resolves under `next dev` (initOpenNextCloudflareForDev), so that test says
 * "Workers" in an environment that has a perfectly good filesystem. Testing the
 * capability is honest where guessing the environment is not: if the disk write
 * fails we are somewhere without a filesystem, which means storage really is
 * unconfigured — say so, instead of surfacing a bare ENOSYS.
 */
async function viaDisk<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (e) {
    if ((e as { code?: string })?.code === "ENOENT") throw e; // genuine missing file
    throw new Error(NO_BUCKET, { cause: e });
  }
}

export const isObjectStorageConfigured = async () => !!(await r2());

/**
 * Whether an upload can be kept right now: an R2 bucket, or the local-disk
 * fallback that `next dev` uses. A production Worker has no disk, so there it
 * means R2. Checkout checks this so a customer is never asked to pay for an
 * order whose payment screenshot has nowhere to go.
 */
export const canStoreUploads = async () =>
  (await isObjectStorageConfigured()) || process.env.NODE_ENV !== "production";

export interface StoredFile {
  url: string; // served via GET /api/files/[key]
  name: string; // original filename
  key: string; // storage key
  size: number;
  contentType: string;
}

export async function saveUpload(file: File): Promise<StoredFile> {
  if (file.size > MAX_BYTES) throw new Error("File too large (max 50 MB)");
  if (file.type && !ALLOWED.has(file.type)) {
    throw new Error("Unsupported file type. Use PDF, AI, PSD, PNG or JPG.");
  }
  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  const bucket = await r2();
  if (bucket) {
    await bucket.put(key, buf, { httpMetadata: { contentType } });
  } else {
    await viaDisk(async () => {
      const { mkdir, writeFile } = await import("node:fs/promises");
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, key), buf);
    });
  }

  return { url: `/api/files/${key}`, name: file.name, key, size: file.size, contentType };
}

export async function readUpload(key: string): Promise<Uint8Array> {
  const safeKey = path.basename(key); // guard against path traversal

  const bucket = await r2();
  if (bucket) {
    const obj = await bucket.get(safeKey);
    if (!obj) {
      const e = new Error("File not found") as Error & { code?: string };
      e.code = "ENOENT";
      throw e;
    }
    return new Uint8Array(await obj.arrayBuffer());
  }

  return viaDisk(async () => {
    const { readFile } = await import("node:fs/promises");
    return new Uint8Array(await readFile(path.join(UPLOAD_DIR, safeKey)));
  });
}

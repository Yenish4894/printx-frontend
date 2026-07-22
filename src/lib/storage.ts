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

// Returns the bound R2 bucket on Workers, or null in local Node (falls to disk).
async function r2(): Promise<R2Like | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as unknown as { UPLOADS?: R2Like };
    return env.UPLOADS ?? null;
  } catch {
    return null; // not running on Workers (local dev / seed)
  }
}

export const isObjectStorageConfigured = async () => (await r2()) !== null;

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
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, key), buf);
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

  const { readFile } = await import("node:fs/promises");
  return new Uint8Array(await readFile(path.join(UPLOAD_DIR, safeKey)));
}

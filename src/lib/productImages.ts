// Rules for product photos. Pure (no Prisma, no Next) so they are unit tested in
// scripts/test-lib-units.ts and shared by the upload route, the link route and
// the admin screen.

/** PNG, JPG and WebP only. SVG is refused on purpose: it can carry scripts. */
const PRODUCT_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const PRODUCT_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 8;
export const PRODUCT_IMAGE_LINK_MAX = 500;

/** What the public image route serves, keyed by the stored file's extension. */
export const IMAGE_EXT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const extOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i).toLowerCase();
};

/** Why an uploaded file can't be a product photo, in words an admin can act on, or null. */
export function productImageFileProblem(file: { size: number; type: string; name: string }): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return `That image is too large. The limit is ${PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`;
  }
  if (!PRODUCT_IMAGE_TYPES.has(file.type)) return "Use a PNG, JPG or WebP image.";
  // The public route decides how to serve a file from its extension, so the
  // name has to agree with the type instead of merely being a well-typed blob.
  if (!(PRODUCT_IMAGE_EXTENSIONS as readonly string[]).includes(extOf(file.name))) {
    return "The file name should end in .png, .jpg, .jpeg or .webp.";
  }
  return null;
}

/** Why a pasted image link can't be used, or null. Only https: browsers block plain http images on a secure site. */
export function externalImageProblem(raw: string): string | null {
  if (raw.length > PRODUCT_IMAGE_LINK_MAX) return `That link is too long (over ${PRODUCT_IMAGE_LINK_MAX} characters).`;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "Enter a full image link that starts with https://";
  }
  if (u.protocol !== "https:") return "The link must start with https:// (browsers block plain http images on our secure site).";
  if (u.username || u.password) return "Remove the username and password from the link.";
  return null;
}

const PREFIX = "/api/product-images/";
const KEY = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Where an uploaded photo is served from. */
export const productImageUrlForKey = (key: string) => PREFIX + key;

/** The storage key behind one of OUR image urls, or null for an external link (or anything unsafe). */
export function productImageKey(url: string): string | null {
  if (!url.startsWith(PREFIX)) return null;
  const key = url.slice(PREFIX.length);
  return KEY.test(key) && !key.includes("..") ? key : null;
}

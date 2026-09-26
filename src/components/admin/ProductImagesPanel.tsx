"use client";

import { useEffect, useRef, useState } from "react";
import { admin, ApiError, type ProductImage } from "@/lib/api";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { useConfirm } from "@/components/ui/UIProvider";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_MAX_BYTES,
  externalImageProblem,
  productImageFileProblem,
} from "@/lib/productImages";

/**
 * Manage one product's photos: upload a file, paste a link, choose which is the
 * primary (the one the catalogue shows) and remove the rest.
 *
 * Links work without any storage set up; uploads need the R2 bucket, and say so
 * plainly if it's missing.
 */
export default function ProductImagesPanel({
  productId,
  productName,
  onClose,
  onChanged,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
  /** Called after every change with the full, ordered list, so the product list can update its thumbnail. */
  onChanged: (images: ProductImage[]) => void;
}) {
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("");
  // Pasted links can point at something that no longer loads; say so instead of showing a broken box.
  const [broken, setBroken] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    admin.products.images
      .list(productId)
      .then((r) => { if (!cancelled) setImages(r.images); })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load the images"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const atLimit = images.length >= MAX_PRODUCT_IMAGES;
  const apply = (next: ProductImage[]) => { setImages(next); onChanged(next); };
  const fail = (e: unknown, fallback: string) => setError(e instanceof ApiError ? e.message : fallback);

  async function upload(file: File) {
    const problem = productImageFileProblem(file);
    if (problem) return setError(problem);
    setBusy("upload");
    setError(null);
    try {
      const { image } = await admin.products.images.upload(productId, file);
      apply([...images, image]);
    } catch (e) {
      fail(e, "Upload failed. Please try again.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function addLink() {
    const url = link.trim();
    const problem = externalImageProblem(url);
    if (problem) return setError(problem);
    setBusy("link");
    setError(null);
    try {
      const { image } = await admin.products.images.addLink(productId, url);
      apply([...images, image]);
      setLink("");
    } catch (e) {
      fail(e, "Could not add that link");
    } finally {
      setBusy(null);
    }
  }

  async function makePrimary(id: string) {
    setBusy(`primary:${id}`);
    setError(null);
    try {
      const { images: next } = await admin.products.images.makePrimary(productId, id);
      apply(next);
    } catch (e) {
      fail(e, "Could not change the primary photo");
    } finally {
      setBusy(null);
    }
  }

  async function remove(img: ProductImage) {
    const ok = await confirm({
      title: "Remove this photo?",
      message: img.isPrimary && images.length > 1
        ? "It is the primary photo, so the next one will take its place on the catalogue."
        : "It will no longer be shown on this product.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    setBusy(`remove:${img.id}`);
    setError(null);
    try {
      await admin.products.images.remove(productId, img.id);
      const rest = images.filter((i) => i.id !== img.id);
      apply(rest.map((i, n) => ({ ...i, isPrimary: n === 0 })));
    } catch (e) {
      fail(e, "Could not remove the photo");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-90" onClick={() => { if (!busy) onClose(); }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-images-title"
        className="fixed z-100 inset-x-4 top-[5vh] mx-auto max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-surface-container-highest">
          <div>
            <h2 id="product-images-title" className="font-headline-md text-headline-md text-primary">Product images</h2>
            <p className="text-body-md text-on-surface-variant">{productName}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            disabled={!!busy}
            aria-label="Close product images"
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <span aria-hidden="true" className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px] mt-0.5">error</span>
              <span>{error}</span>
            </p>
          )}

          {loading ? (
            <LoadingState label="Loading images" compact />
          ) : images.length === 0 ? (
            <p className="rounded-lg bg-surface-container px-4 py-6 text-center text-body-md text-on-surface-variant">
              No photos yet. Until you add one, the catalogue shows a printer icon for this product.
            </p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" aria-label="Photos">
              {images.map((img, n) => (
                <li key={img.id} className="rounded-lg border border-outline-variant overflow-hidden bg-white flex flex-col">
                  <div className="aspect-[4/3] bg-surface-container relative flex items-center justify-center">
                    {broken.has(img.id) ? (
                      <span className="px-3 text-center text-xs text-on-surface-variant">This link no longer loads a picture</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt || `${productName}, photo ${n + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => setBroken((b) => new Set(b).add(img.id))}
                      />
                    )}
                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    {img.isPrimary ? (
                      <span className="px-2 text-xs text-on-surface-variant">Shown on the catalogue</span>
                    ) : (
                      <button
                        onClick={() => makePrimary(img.id)}
                        disabled={!!busy}
                        className="px-2 py-1 rounded-md text-xs font-bold text-secondary hover:bg-secondary/10 disabled:opacity-40"
                      >
                        {busy === `primary:${img.id}` ? "Saving…" : "Make primary"}
                      </button>
                    )}
                    <button
                      onClick={() => remove(img)}
                      disabled={!!busy}
                      aria-label={`Remove photo ${n + 1}`}
                      className="p-1.5 rounded-full text-error hover:bg-error-container/30 disabled:opacity-40"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                        {busy === `remove:${img.id}` ? "hourglass_empty" : "delete"}
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-4 border-t border-surface-container-highest pt-6">
            <div>
              <input
                ref={fileRef}
                id="product-image-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
              />
              <Button
                variant="secondary"
                icon="upload"
                loading={busy === "upload"}
                disabled={!!busy || atLimit}
                onClick={() => fileRef.current?.click()}
              >
                Upload a photo
              </Button>
              <p className="mt-2 text-xs text-on-surface-variant">
                PNG, JPG or WebP, up to {PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)} MB. The first photo is the one the catalogue shows.
              </p>
            </div>

            <div>
              <label htmlFor="product-image-link" className="block text-sm font-bold text-on-surface">
                Or paste a link to a photo
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="product-image-link"
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                  placeholder="https://…"
                  disabled={!!busy || atLimit}
                  className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
                />
                <Button variant="secondary" loading={busy === "link"} disabled={!!busy || atLimit || !link.trim()} onClick={addLink}>
                  Add link
                </Button>
              </div>
            </div>

            <p className={`text-xs ${atLimit ? "font-bold text-error" : "text-on-surface-variant"}`}>
              {images.length} of {MAX_PRODUCT_IMAGES} photos{atLimit ? ". Remove one to add another." : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

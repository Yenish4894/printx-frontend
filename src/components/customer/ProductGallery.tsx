"use client";

import { useState } from "react";

/**
 * The photos on a product page: one large picture and, when there are several,
 * a grid of thumbnails to switch between them. If every picture fails to load
 * (a pasted link that has since died) it renders nothing at all rather than a
 * grey box with a broken-image icon.
 */
export default function ProductGallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  const usable = images.filter((i) => !broken.has(i.url));
  if (usable.length === 0) return null;
  const current = usable[Math.min(index, usable.length - 1)];

  return (
    <section aria-label={`${name} photos`} className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden">
      <div className="aspect-[4/3] bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.url}
          src={current.url}
          alt={current.alt || name}
          className="w-full h-full object-cover"
          onError={() => setBroken((b) => new Set(b).add(current.url))}
        />
      </div>
      {usable.length > 1 && (
        <ul className="grid grid-cols-4 gap-2 p-3">
          {usable.map((img, n) => {
            const active = img.url === current.url;
            return (
              <li key={img.url}>
                <button
                  onClick={() => setIndex(n)}
                  aria-label={`Show photo ${n + 1} of ${usable.length}`}
                  aria-current={active ? "true" : undefined}
                  className={`block w-full aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    active ? "border-secondary" : "border-transparent hover:border-outline-variant"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setBroken((b) => new Set(b).add(img.url))}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

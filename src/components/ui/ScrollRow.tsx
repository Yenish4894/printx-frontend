"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A horizontally scrolling row of chips/pills (category filters, tabs) that
 * shows edge fades and click-to-scroll arrows only when there is actually
 * more content off-screen.
 *
 * The products page used to hide its scrollbar entirely (no-scrollbar) with
 * nothing else to signal it was scrollable. With two categories that's
 * invisible; the day a third or fourth category is added, it silently runs
 * off the edge of the screen with no way for anyone to discover it's there.
 */
export default function ScrollRow({
  children,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    update();
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canLeft && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-surface to-transparent z-10"
          />
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-surface border border-outline-variant shadow-md hover:border-secondary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
          </button>
        </>
      )}
      <div
        ref={ref}
        onScroll={update}
        aria-label={ariaLabel}
        className={`flex overflow-x-auto no-scrollbar scroll-smooth ${className}`}
      >
        {children}
      </div>
      {canRight && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface to-transparent z-10"
          />
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-surface border border-outline-variant shadow-md hover:border-secondary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}

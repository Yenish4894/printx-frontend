"use client";

/**
 * Prev/next pager for the list pages. Every list query used to be unbounded, so
 * these pages downloaded the entire table; they now take one page at a time and
 * this is how you move between them.
 *
 * Renders nothing for a single page of results, so a small dataset looks exactly
 * as it did before.
 */
export default function Pager({
  page,
  pageSize,
  total,
  hasMore,
  onPage,
  busy,
  label = "results",
}: {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPage: (next: number) => void;
  busy?: boolean;
  label?: string;
}) {
  if (total <= pageSize && page === 1) return null;

  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 pt-6"
      aria-label={`${label} pagination`}
    >
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        Showing <span className="font-bold text-on-surface">{first}–{last}</span> of{" "}
        <span className="font-bold text-on-surface">{total.toLocaleString("en-IN")}</span> {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1 || busy}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
          Previous
        </button>
        <span className="text-body-md text-on-surface-variant px-2">
          Page {page} of {lastPage}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasMore || busy}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </nav>
  );
}

"use client";

import type { ReactNode } from "react";

/**
 * Empty, loading and error states, which the app previously improvised per
 * screen: twelve empty-state shapes ranging from a full icon+title+action block
 * on the cart down to a bare italic table cell reading "No orders yet.", and
 * sixteen loading strings, four of which still ended in "..." rather than "…".
 *
 * An empty state is a designed moment, not an absence: it says what would be
 * here, and offers the action that puts something here.
 */

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** For table cells and side panels: smaller icon, tighter padding. */
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-10 px-4" : "py-20 px-6"}`}>
      {/* The icon sits in a tinted disc rather than floating as a faint glyph:
          the loose versions rendered at ~2:1 contrast and read as a speck. */}
      <span
        className={`flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant mb-4 ${
          compact ? "w-12 h-12" : "w-16 h-16"
        }`}
      >
        <span aria-hidden="true" className={`material-symbols-outlined ${compact ? "text-[24px]" : "text-[32px]"}`}>
          {icon}
        </span>
      </span>
      <p className={`font-headline-md text-on-surface ${compact ? "text-base" : "text-headline-md"}`}>{title}</p>
      {description && (
        <p className="text-body-md text-on-surface-variant mt-2 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Spinner + label. One spinner, one ellipsis, everywhere. */
export function LoadingState({ label = "Loading", compact }: { label?: string; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-on-surface-variant ${compact ? "py-10" : "py-20"}`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className={`material-symbols-outlined animate-spin ${compact ? "text-[24px]" : "text-[32px]"}`}>
        progress_activity
      </span>
      <p className="text-body-md mt-3">{label}…</p>
    </div>
  );
}

/** Error with the one thing that matters after an error: a way to try again. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  compact,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-10 px-4" : "py-20 px-6"}`}
      role="alert"
    >
      <span className={`flex items-center justify-center rounded-full bg-error-container text-on-error-container mb-4 ${compact ? "w-12 h-12" : "w-16 h-16"}`}>
        <span aria-hidden="true" className={`material-symbols-outlined ${compact ? "text-[24px]" : "text-[32px]"}`}>error</span>
      </span>
      <p className={`font-headline-md text-on-surface ${compact ? "text-base" : "text-headline-md"}`}>{title}</p>
      {message && <p className="text-body-md text-on-surface-variant mt-2 max-w-sm">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 min-h-11 px-6 py-3 rounded-lg border border-outline-variant font-button text-on-surface bg-surface hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">refresh</span>
          Try again
        </button>
      )}
    </div>
  );
}

/** The same three states inside a table body, so rows and states agree. */
export function TableState({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        {children}
      </td>
    </tr>
  );
}

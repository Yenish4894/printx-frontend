"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The single primary-action pattern.
 *
 * Before this existed the app had 24 distinct class signatures for one button:
 * radius drifted across rounded / rounded-lg / rounded-xl, padding across
 * py-2 / 2.5 / 3 / 4, shadow across sm / md / lg, press feedback between
 * scale-95, scale-[0.98] and nothing at all, and disabled between opacity-50,
 * opacity-60 and no treatment. Same button, twenty-four looks.
 *
 * Variants are named for their job, not their colour, so a call site never has
 * to know which gradient token is current.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-button rounded-lg " +
  "transition-all active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

// min-h keeps every control at or above the 44px touch target at md and lg.
const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-6 py-3 text-button",
  lg: "min-h-12 px-8 py-4 text-button",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "primary-accent-gradient text-white shadow-lg shadow-secondary/20 hover:brightness-110",
  secondary: "border border-outline-variant text-on-surface bg-surface hover:bg-surface-container",
  ghost: "text-on-surface-variant hover:bg-surface-container",
  danger: "bg-error text-on-error shadow-lg shadow-error/20 hover:brightness-110",
};

interface Common {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Swaps the leading icon for a spinner and disables the control. */
  loading?: boolean;
  /** Material Symbols ligature, e.g. "arrow_forward". */
  icon?: string;
  iconAfter?: string;
  children?: ReactNode;
  className?: string;
}

function inner({ loading, icon, iconAfter, children }: Common) {
  return (
    <>
      {loading ? (
        <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[20px]">
          progress_activity
        </span>
      ) : icon ? (
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{icon}</span>
      ) : null}
      {children}
      {iconAfter && !loading ? (
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{iconAfter}</span>
      ) : null}
    </>
  );
}

const cls = (p: Common) =>
  [BASE, SIZES[p.size ?? "md"], VARIANTS[p.variant ?? "primary"], p.fullWidth ? "w-full" : "", p.className ?? ""]
    .filter(Boolean)
    .join(" ");

export default function Button({
  variant, size, fullWidth, loading, icon, iconAfter, children, className, ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  const p = { variant, size, fullWidth, loading, icon, iconAfter, children, className };
  return (
    <button {...rest} className={cls(p)} disabled={rest.disabled || loading} aria-busy={loading || undefined}>
      {inner(p)}
    </button>
  );
}

/** Same pattern for navigation. Keeps a link that looks like a button a link. */
export function ButtonLink({
  variant, size, fullWidth, icon, iconAfter, children, className, ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  const p = { variant, size, fullWidth, icon, iconAfter, children, className };
  return (
    <Link {...rest} className={cls(p)}>
      {inner(p)}
    </Link>
  );
}

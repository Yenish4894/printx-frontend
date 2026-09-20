"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One page-header composition. The app had thirteen distinct h1 signatures
 * (text-primary vs text-primary tracking-tight vs text-on-surface vs bare), so
 * the same element sat at a different size, colour and tracking depending on
 * which screen you were on.
 *
 * Breadcrumbs are part of the header because wayfinding is: "where am I" should
 * be answered by the title block, not by a separate improvised row.
 */
export interface Crumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  crumbs,
  className = "",
}: {
  title: string;
  description?: string;
  /** Right-aligned actions. Primary action last, so it lands nearest the edge. */
  actions?: ReactNode;
  crumbs?: Crumb[];
  className?: string;
}) {
  return (
    <header className={`mb-8 ${className}`}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-2 font-label-caps text-label-caps text-on-surface-variant">
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chevron_right</span>
                )}
                {c.href ? (
                  <Link href={c.href} className="hover:text-secondary transition-colors">{c.label}</Link>
                ) : (
                  <span className="text-on-surface" aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="font-body-md text-on-surface-variant mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

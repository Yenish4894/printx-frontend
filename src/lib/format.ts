// Shared date/number formatters so every page renders dates the same way.

const isValid = (d: Date) => !Number.isNaN(d.getTime());

/** e.g. "23 Jul 2026, 1:05 am" — the default for lists and detail pages. */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!isValid(d)) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** e.g. "23 Jul 2026" — date only. */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!isValid(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

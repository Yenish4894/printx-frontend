// Shared display formatters so every page renders dates and specs the same way.

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

/**
 * The shape quote.ts persists into OrderItem.specSnapshot / CartItem.specSnapshot:
 * one entry per chosen option. Kept here because the cart, the customer order
 * page and the admin order page all render it, and each had hand-rolled its own
 * parser — two of them read it as an object map and silently rendered nothing
 * (customer) or raw JSON keyed by array index (admin).
 */
interface SpecSnapshotEntry {
  group: string;
  option: string;
  addOn?: number;
}

/** Chosen specs as [group, option] pairs. Tolerates null/legacy rows. */
export function specEntries(spec: unknown): [string, string][] {
  if (!Array.isArray(spec)) return [];
  return spec
    .filter((s): s is SpecSnapshotEntry => !!s && typeof s === "object" && "group" in s && "option" in s)
    .map((s) => [String(s.group), String(s.option)]);
}

// Human-facing order and invoice numbers. Pure, so they are unit tested
// (scripts/test-lib-units.ts); the services supply the last number issued.

/**
 * One past the highest number issued in a series. Max + 1, not count() + 1:
 * a count reuses a number as soon as any row is deleted (3 orders present,
 * BG-...-00004 already taken -> 00004 again). A suffix that is not a number
 * is refused rather than silently restarting the series at 00001, which
 * would collide with the unique index on every attempt.
 */
function nextInSeries(prefix: string, last: string | null): string {
  let n = 0;
  if (last) {
    const suffix = last.slice(prefix.length);
    if (!last.startsWith(prefix) || !/^\d+$/.test(suffix)) {
      throw new Error(`Unexpected number format for series ${prefix}: ${last}`);
    }
    n = Number(suffix);
  }
  return `${prefix}${String(n + 1).padStart(5, "0")}`;
}

export const orderNumberPrefix = (year: number) => `BG-${year}-`;

/** BG-2026-00042: calendar year, issued at checkout, paid or not. */
export const nextOrderNumber = (year: number, lastOrderNumber: string | null) =>
  nextInSeries(orderNumberPrefix(year), lastOrderNumber);

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The Indian financial year (1 April to 31 March, IST) containing `at`, as "26-27". */
export function financialYear(at: Date): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const start = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  const yy = (y: number) => String(y % 100).padStart(2, "0");
  return `${yy(start)}-${yy(start + 1)}`;
}

export const invoicePrefix = (at: Date) => `INV/${financialYear(at)}/`;

/**
 * INV/26-27/00001: its own series, issued only when payment is verified. GST
 * invoices must be a consecutive serial, unique per financial year and at most
 * 16 characters; deriving them from order numbers left gaps wherever an order
 * went unpaid or was cancelled, and issued them out of order.
 */
export const nextInvoiceNumber = (at: Date, lastInvoiceNumber: string | null) =>
  nextInSeries(invoicePrefix(at), lastInvoiceNumber);

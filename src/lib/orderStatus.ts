// Single source of truth for order/refund status presentation + transitions.
// Used by both customer and admin pages so badges, labels and allowed moves
// never diverge.

export type OrderStatus =
  | "PLACED"
  | "PAYMENT_CONFIRMED"
  | "DESIGN_REVIEW"
  | "PRINTING"
  | "QUALITY_CHECK"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface StatusMeta {
  label: string;
  badge: string; // tailwind classes for the pill
  dot: string; // dot color
}

export const ORDER_STATUS: Record<string, StatusMeta> = {
  PLACED: { label: "Placed", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  DESIGN_REVIEW: { label: "Design Review", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  PRINTING: { label: "Printing", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  QUALITY_CHECK: { label: "Quality Check", badge: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  DELIVERED: { label: "Delivered", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export const REFUND_STATUS: Record<string, StatusMeta> = {
  PENDING: { label: "Pending", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  PROCESSING: { label: "Processing", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  CREDITED: { label: "Credited", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

/** Humanize any UPPER_SNAKE status; falls back to a title-cased version. */
export function statusLabel(status: string, map: Record<string, StatusMeta> = ORDER_STATUS) {
  return (
    map[status]?.label ??
    status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function statusBadge(status: string, map: Record<string, StatusMeta> = ORDER_STATUS) {
  return map[status]?.badge ?? "bg-surface-container text-on-surface-variant";
}

export function statusDot(status: string, map: Record<string, StatusMeta> = ORDER_STATUS) {
  return map[status]?.dot ?? "bg-on-surface-variant";
}

// The normal forward pipeline (excludes CANCELLED, which is a side-transition).
export const ORDER_PIPELINE: OrderStatus[] = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "DESIGN_REVIEW",
  "PRINTING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const TERMINAL = new Set<OrderStatus>(["DELIVERED", "CANCELLED"]);
const CANCELLABLE = new Set<OrderStatus>(["PLACED", "PAYMENT_CONFIRMED", "DESIGN_REVIEW"]);

/**
 * Valid next statuses an admin may move an order to: the next pipeline step
 * forward, plus CANCELLED while still cancellable. Terminal states allow none.
 */
export function nextStatuses(current: string): OrderStatus[] {
  if (TERMINAL.has(current as OrderStatus)) return [];
  const idx = ORDER_PIPELINE.indexOf(current as OrderStatus);
  const forward = idx >= 0 && idx < ORDER_PIPELINE.length - 1 ? [ORDER_PIPELINE[idx + 1]] : [];
  const cancel: OrderStatus[] = CANCELLABLE.has(current as OrderStatus) ? ["CANCELLED"] : [];
  return [...forward, ...cancel];
}

export const isCancellable = (status: string) => CANCELLABLE.has(status as OrderStatus);

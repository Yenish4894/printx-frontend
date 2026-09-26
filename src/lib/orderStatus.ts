// Single source of truth for order/refund status presentation + transitions.
// Used by both customer and admin pages so badges, labels and allowed moves
// never diverge.

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "PLACED"
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
  PAYMENT_PENDING: { label: "Payment Pending", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  PLACED: { label: "Placed", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
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
  // The enum value predates bank transfers; to a customer the money has been sent back.
  CREDITED: { label: "Refunded", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

/**
 * Artwork file states. Note UPLOAD_PENDING, not PENDING — the customer order
 * page previously compared against "PENDING", which never matched, so an item
 * still awaiting artwork rendered as if its file were fine.
 */
export const FILE_STATUS: Record<string, StatusMeta> = {
  UPLOAD_PENDING: { label: "Awaiting artwork", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  UPLOADED: { label: "Uploaded", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  APPROVED: { label: "Approved", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Needs changes", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

/** Human label for an artwork state — never show the raw enum to a customer. */
export const fileStatusLabel = (status: string | null | undefined) =>
  status ? (FILE_STATUS[status]?.label ?? statusLabel(status, FILE_STATUS)) : "Awaiting artwork";

/** An item still needs artwork when none is attached or it was rejected. */
export const needsArtwork = (status: string | null | undefined) =>
  !status || status === "UPLOAD_PENDING" || status === "REJECTED";

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
  "PAYMENT_PENDING",
  "PLACED",
  "DESIGN_REVIEW",
  "PRINTING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const TERMINAL = new Set<OrderStatus>(["DELIVERED", "CANCELLED"]);

/**
 * Statuses at which an order may still be cancelled (before production starts).
 * Exported so the order service guards on the SAME list the UI offers — it was
 * previously duplicated there and the two could silently drift apart.
 */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PAYMENT_PENDING",
  "PLACED",
  "DESIGN_REVIEW",
];
const CANCELLABLE = new Set<OrderStatus>(CANCELLABLE_STATUSES);

/**
 * Valid next statuses an admin may move an order to: the next pipeline step
 * forward, plus CANCELLED while still cancellable. Terminal states allow none.
 */
export function nextStatuses(current: string): OrderStatus[] {
  if (TERMINAL.has(current as OrderStatus)) return [];
  // An unpaid order reaches PLACED only through payment approval, which checks
  // the proof. Offering PLACED here would let production start on money that
  // was never verified.
  if (current === "PAYMENT_PENDING") return ["CANCELLED"];
  const idx = ORDER_PIPELINE.indexOf(current as OrderStatus);
  const forward = idx >= 0 && idx < ORDER_PIPELINE.length - 1 ? [ORDER_PIPELINE[idx + 1]] : [];
  const cancel: OrderStatus[] = CANCELLABLE.has(current as OrderStatus) ? ["CANCELLED"] : [];
  return [...forward, ...cancel];
}

export const isCancellable = (status: string) => CANCELLABLE.has(status as OrderStatus);

/**
 * Orders whose money is not (or no longer) with us. Revenue, lifetime spend and
 * the customer's "total spent" all exclude exactly this list, so a new unpaid
 * status only has to be added here.
 */
export const UNPAID_OR_VOID_STATUSES: OrderStatus[] = ["PAYMENT_PENDING", "CANCELLED"];

/** Payment has been verified: the order is past PAYMENT_PENDING and not cancelled. */
export const isPaidStatus = (status: string) =>
  !UNPAID_OR_VOID_STATUSES.includes(status as OrderStatus);

/**
 * Paid and not yet delivered: the work the press owes. Unpaid orders are
 * waiting on the customer and are counted separately.
 */
export const IN_PRODUCTION_STATUSES: OrderStatus[] = [
  "PLACED",
  "DESIGN_REVIEW",
  "PRINTING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
];

/** The customer's "Active" tab: anything not finished, including unpaid orders they still have to act on. */
export const ACTIVE_STATUSES: OrderStatus[] = ["PAYMENT_PENDING", ...IN_PRODUCTION_STATUSES];

/** Where a bank-transfer payment stands, for badges and copy. */
export type PaymentStage = "awaiting_proof" | "in_review" | "rejected" | "verified";

export function paymentStage(p: { status: string; proofUrl: string | null } | null | undefined): PaymentStage {
  if (!p) return "awaiting_proof";
  if (p.status === "SUCCESS") return "verified";
  if (p.status === "FAILED") return "rejected";
  return p.proofUrl ? "in_review" : "awaiting_proof";
}

export const PAYMENT_STAGE: Record<PaymentStage, StatusMeta> = {
  awaiting_proof: { label: "Awaiting payment", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  in_review: { label: "Proof under review", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  rejected: { label: "Proof rejected", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  verified: { label: "Payment verified", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

// Admin approval for new customer signups. Pure (no Prisma, no Next) so the
// rules the login route, the session check and the admin screens all share are
// unit tested in scripts/test-lib-units.ts.

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/** The applicant reads a rejection reason when they try to sign in. */
export const APPROVAL_REASON_MIN = 3;
export const APPROVAL_REASON_MAX = 300;

/** Same shape as the order/refund status pills so admin badges look alike. */
export const APPROVAL_STATUS: Record<ApprovalStatus, { label: string; badge: string; dot: string }> = {
  PENDING: { label: "Pending approval", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

// Non-breaking spaces so the number never wraps across two lines in an alert box.
export const SUPPORT_PHONE = "+91\u00A072030\u00A000701";

/**
 * Why an account cannot get in yet, in words the applicant can act on, or null
 * when it can. Only ever shown AFTER the password has been verified, so this
 * cannot be used to probe which mobile numbers have applied.
 */
export function approvalBlock(status: string, rejectReason?: string | null): string | null {
  if (isApproved(status)) return null;
  if (status === "PENDING") {
    return "Your account is awaiting approval. We check every new business before giving access, " +
      `and we'll approve it as soon as we can. Questions? Call ${SUPPORT_PHONE}.`;
  }
  if (status === "REJECTED") {
    const why = rejectReason?.trim();
    return `Your account request wasn't approved${why ? `: ${why}` : "."} ` +
      `If you think this is a mistake, call ${SUPPORT_PHONE}.`;
  }
  // Anything unrecognised is closed, same as isApproved: an access gate must
  // not let a status it has never heard of through.
  return `Your account can't be used yet. Please call ${SUPPORT_PHONE}.`;
}

/**
 * Shown right after signing up. Nothing is emailed or texted when an admin
 * decides, so this has to tell the applicant to come back and sign in, or they
 * would wait for a message that never arrives.
 */
export const applicationReceived = () =>
  "Thanks! Your account is awaiting approval. We check every new business before giving access. " +
  "Once it's approved, come back and sign in with the mobile number and password you just chose. " +
  `Questions? Call ${SUPPORT_PHONE}.`;

/** Only an approved account may hold a session. */
export const isApproved = (status: string) => status === "APPROVED";

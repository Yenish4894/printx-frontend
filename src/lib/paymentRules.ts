// Pure bank-transfer payment rules, kept free of Prisma and Next imports so
// `npm test` can exercise them under Node. The services and routes that enforce
// them live elsewhere and delegate here.

/** The business account customers transfer to (from PlatformSettings). */
export interface BankDetails {
  accountName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
}

/** Enough to actually receive a transfer: who, which account, which branch. */
export const bankDetailsComplete = (b: BankDetails) =>
  !!(b.accountName && b.accountNumber && b.ifsc);

/** What a payment-proof upload may be: images a phone produces, or a PDF receipt. */
export const PROOF_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);
export const PROOF_MAX_BYTES = 10 * 1024 * 1024;
export const PROOF_REFERENCE_MAX = 60;
/**
 * A UTR as stored: upper-case letters and digits only. Customers paste them
 * with spaces, dashes or a label ("UTR:", "UTR No.", "Ref #"); normalizing
 * makes the same transfer compare equal across orders (the admin's
 * duplicate-UTR warning). A label is only stripped when a separator or digit
 * follows it, so a reference that merely starts with those letters survives.
 */
const REFERENCE_LABEL = /^(?:UTR|REF|TXN|TRANSACTION)(?:\s*(?:NO|NUMBER|ID))?(?=[\s:.#-]|\d)[\s:.#-]*/;

export const normalizeReference = (raw: string | null | undefined) =>
  (raw ?? "").trim().toUpperCase().replace(REFERENCE_LABEL, "").replace(/[^A-Z0-9]/g, "") || null;

/** The customer reads a rejection reason and has to act on it. */
export const REJECT_REASON_MIN = 3;
export const REJECT_REASON_MAX = 300;

/** Why a proof file is unacceptable, in words a customer can act on; null if fine. */
export function proofFileProblem(file: { size: number; type: string }): string | null {
  if (file.size === 0) return "That file is empty. Please choose the screenshot again.";
  if (file.size > PROOF_MAX_BYTES) return "Screenshot is too large (max 10 MB).";
  if (!PROOF_TYPES.has(file.type)) return "Upload a PNG, JPG or WebP screenshot, or a PDF receipt.";
  return null;
}

// Pure checks for the shared lib modules touched by the bank-transfer / pagination
// change: settings + admin DTOs, pagination, spec parsing, status helpers, payment
// rules and order numbers. None of these import @/lib/prisma, so they run under tsx.
// Run: npx tsx scripts/test-lib-units.ts
import { settingsSchema } from "../src/lib/dto/settings";
import { paymentReviewSchema, orderStatusSchema, signupReviewSchema } from "../src/lib/dto/admin";
import { approvalBlock, isApproved, APPROVAL_STATUS, APPROVAL_REASON_MAX } from "../src/lib/approval";
import { pageParams, pageMeta, firstPage, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../src/lib/pagination";
import { specEntries, formatDate, formatDateTime } from "../src/lib/format";
import {
  nextStatuses, statusLabel, statusBadge, fileStatusLabel, needsArtwork,
  PAYMENT_STAGE, REFUND_STATUS,
} from "../src/lib/orderStatus";
import {
  bankDetailsComplete,
  proofFileProblem,
  PROOF_MAX_BYTES,
  PROOF_REFERENCE_MAX,
  REJECT_REASON_MAX,
  normalizeReference,
} from "../src/lib/paymentRules";
import { nextOrderNumber, nextInvoiceNumber, financialYear } from "../src/lib/orderNumber";
import {
  ACTIVE_STATUSES,
  IN_PRODUCTION_STATUSES,
  UNPAID_OR_VOID_STATUSES,
  ORDER_STATUS,
  isPaidStatus,
} from "../src/lib/orderStatus";
type Settings = Record<string, string | null | undefined>;

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log(`${ok ? "✅" : "❌"} ${name}${ok ? "" : `\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`}`);
};
const okParse = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => schema.safeParse(v).success;
const parsed = <T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, v: unknown) =>
  schema.safeParse(v).data;

// ── settings DTO: bank fields ──
console.log("── settings: bank account number ──");
eq("9 digits ok", okParse(settingsSchema, { bankAccountNumber: "123456789" }), true);
eq("18 digits ok", okParse(settingsSchema, { bankAccountNumber: "123456789012345678" }), true);
eq("8 digits rejected", okParse(settingsSchema, { bankAccountNumber: "12345678" }), false);
eq("19 digits rejected", okParse(settingsSchema, { bankAccountNumber: "1234567890123456789" }), false);
eq("letters rejected", okParse(settingsSchema, { bankAccountNumber: "12345ABC901" }), false);
eq("spaces inside rejected", okParse(settingsSchema, { bankAccountNumber: "5010 0123 4567" }), false);
eq("surrounding whitespace trimmed", parsed<Settings>(settingsSchema, { bankAccountNumber: "  501001234567  " })?.bankAccountNumber, "501001234567");
eq("empty string clears (null)", parsed<Settings>(settingsSchema, { bankAccountNumber: "" })?.bankAccountNumber, null);
eq("whitespace-only clears (null)", parsed<Settings>(settingsSchema, { bankAccountNumber: "   " })?.bankAccountNumber, null);
eq("explicit null ok", parsed<Settings>(settingsSchema, { bankAccountNumber: null })?.bankAccountNumber, null);
eq("omitted stays undefined (partial update)", "bankAccountNumber" in (parsed<Settings>(settingsSchema, {}) ?? {}), false);

console.log("── settings: IFSC ──");
eq("valid IFSC ok", parsed<Settings>(settingsSchema, { bankIfsc: "HDFC0001234" })?.bankIfsc, "HDFC0001234");
eq("lowercase is upper-cased", parsed<Settings>(settingsSchema, { bankIfsc: "hdfc0001234" })?.bankIfsc, "HDFC0001234");
eq("padded lowercase trimmed + upper-cased", parsed<Settings>(settingsSchema, { bankIfsc: " sbin0a1b2c3 " })?.bankIfsc, "SBIN0A1B2C3");
eq("5th char must be 0", okParse(settingsSchema, { bankIfsc: "HDFC1001234" }), false);
eq("too short rejected", okParse(settingsSchema, { bankIfsc: "HDFC000123" }), false);
eq("too long rejected", okParse(settingsSchema, { bankIfsc: "HDFC00012345" }), false);
eq("digits in bank code rejected", okParse(settingsSchema, { bankIfsc: "HD1C0001234" }), false);
eq("empty string clears (null)", parsed<Settings>(settingsSchema, { bankIfsc: "" })?.bankIfsc, null);

console.log("── settings: names ──");
eq("account name trimmed", parsed<Settings>(settingsSchema, { bankAccountName: "  Bhagini Graphics " })?.bankAccountName, "Bhagini Graphics");
eq("bank name empty clears", parsed<Settings>(settingsSchema, { bankName: "" })?.bankName, null);
eq("account name > 100 rejected", okParse(settingsSchema, { bankAccountName: "x".repeat(101) }), false);
eq("full valid bank block ok", okParse(settingsSchema, {
  bankAccountName: "Bhagini Graphics", bankName: "HDFC Bank", bankAccountNumber: "50100123456789",
  bankIfsc: "hdfc0001234",
}), true);
eq("UPI is no longer a settings field (silently ignored, not validated)", okParse(settingsSchema, { bankUpiId: "not-an-upi-handle" }), true);

// ── admin DTOs ──
console.log("── paymentReviewSchema ──");
eq("APPROVE with no reason ok", okParse(paymentReviewSchema, { action: "APPROVE" }), true);
eq("APPROVE with a note ok", okParse(paymentReviewSchema, { action: "APPROVE", reason: "UTR matched" }), true);
eq("REJECT without reason rejected", okParse(paymentReviewSchema, { action: "REJECT" }), false);
eq("REJECT with empty reason rejected", okParse(paymentReviewSchema, { action: "REJECT", reason: "" }), false);
eq("REJECT with 2-char reason rejected", okParse(paymentReviewSchema, { action: "REJECT", reason: "no" }), false);
eq("REJECT reason is trimmed before length check", okParse(paymentReviewSchema, { action: "REJECT", reason: "  ab   " }), false);
eq("REJECT with 3-char reason ok", okParse(paymentReviewSchema, { action: "REJECT", reason: "bad" }), true);
eq("REJECT error points at reason", paymentReviewSchema.safeParse({ action: "REJECT" }).error?.issues?.[0]?.path, ["reason"]);
eq("REJECT reason > 300 rejected", okParse(paymentReviewSchema, { action: "REJECT", reason: "x".repeat(301) }), false);
eq("unknown action rejected", okParse(paymentReviewSchema, { action: "REFUND" }), false);
eq("missing action rejected", okParse(paymentReviewSchema, {}), false);

console.log("── orderStatusSchema ──");
eq("PLACED no longer settable by hand", okParse(orderStatusSchema, { status: "PLACED" }), false);
eq("PAYMENT_CONFIRMED retired", okParse(orderStatusSchema, { status: "PAYMENT_CONFIRMED" }), false);
eq("PAYMENT_PENDING not settable", okParse(orderStatusSchema, { status: "PAYMENT_PENDING" }), false);
eq("DESIGN_REVIEW settable", okParse(orderStatusSchema, { status: "DESIGN_REVIEW" }), true);
eq("CANCELLED settable", okParse(orderStatusSchema, { status: "CANCELLED", note: "customer asked" }), true);

// ── pagination ──
console.log("── pageParams ──");
const U = (qs: string) => `https://x.test/api/orders${qs}`;
eq("defaults", pageParams(U("")), { page: 1, pageSize: DEFAULT_PAGE_SIZE, skip: 0, take: DEFAULT_PAGE_SIZE });
eq("custom default size", pageParams(U(""), 20), { page: 1, pageSize: 20, skip: 0, take: 20 });
eq("page 3 of 25", pageParams(U("?page=3&pageSize=25")), { page: 3, pageSize: 25, skip: 50, take: 25 });
eq("page 0 -> 1", pageParams(U("?page=0")).page, 1);
eq("negative page -> 1", pageParams(U("?page=-4")).page, 1);
eq("non-numeric page -> 1", pageParams(U("?page=abc")).page, 1);
eq("Infinity page -> 1", pageParams(U("?page=Infinity")).page, 1);
eq("fractional page floored", pageParams(U("?page=2.9")).page, 2);
eq("pageSize above MAX clamped", pageParams(U("?pageSize=10000")).pageSize, MAX_PAGE_SIZE);
eq("pageSize 0 -> default", pageParams(U("?pageSize=0")).pageSize, DEFAULT_PAGE_SIZE);
eq("non-numeric pageSize -> default", pageParams(U("?pageSize=all")).pageSize, DEFAULT_PAGE_SIZE);
eq("accepts a URL object", pageParams(new URL(U("?page=2&pageSize=10"))).skip, 10);
eq("firstPage", firstPage(30), { page: 1, pageSize: 30, skip: 0, take: 30 });

console.log("── pageMeta ──");
const p2 = pageParams(U("?page=2&pageSize=10"));
eq("more remain", pageMeta(10, 35, p2), { total: 35, page: 2, pageSize: 10, hasMore: true });
eq("exact last page", pageMeta(10, 20, p2).hasMore, false);
eq("short last page", pageMeta(5, 15, p2).hasMore, false);
eq("empty list", pageMeta(0, 0, firstPage()).hasMore, false);

// ── spec parsing ──
console.log("── specEntries ──");
eq("array of entries -> pairs", specEntries([{ group: "Paper", option: "Art 300gsm", addOn: 2 }, { group: "Sides", option: "Double" }]),
  [["Paper", "Art 300gsm"], ["Sides", "Double"]]);
eq("null -> []", specEntries(null), []);
eq("undefined -> []", specEntries(undefined), []);
eq("legacy object map -> []", specEntries({ Paper: "Art 300gsm" }), []);
eq("string -> []", specEntries("Paper: Art"), []);
eq("malformed entries filtered", specEntries([null, 5, "x", { group: "Paper" }, { option: "Matte" }, { group: "Finish", option: "Matte" }]),
  [["Finish", "Matte"]]);
eq("non-string values stringified", specEntries([{ group: "Qty", option: 500 }]), [["Qty", "500"]]);

console.log("── date formatters ──");
eq("formatDate null -> dash", formatDate(null), "—");
eq("formatDate invalid -> dash", formatDate("not a date"), "—");
eq("formatDateTime empty -> dash", formatDateTime(""), "—");
eq("formatDate renders year", formatDate("2026-07-23T10:00:00Z").includes("2026"), true);

// ── status helpers ──
console.log("── status helpers ──");
eq("unknown status has no transitions", nextStatuses("SOMETHING_ELSE"), []);
eq("statusLabel falls back to title case", statusLabel("ON_HOLD"), "On Hold");
eq("statusBadge falls back to neutral", statusBadge("ON_HOLD"), "bg-surface-container text-on-surface-variant");
eq("refund CREDITED reads as Refunded", statusLabel("CREDITED", REFUND_STATUS), "Refunded");
eq("payment stage labels", Object.keys(PAYMENT_STAGE), ["awaiting_proof", "in_review", "rejected", "verified"]);
eq("fileStatusLabel null -> Awaiting artwork", fileStatusLabel(null), "Awaiting artwork");
eq("fileStatusLabel REJECTED", fileStatusLabel("REJECTED"), "Needs changes");
eq("needsArtwork: none", needsArtwork(undefined), true);
eq("needsArtwork: UPLOAD_PENDING", needsArtwork("UPLOAD_PENDING"), true);
eq("needsArtwork: REJECTED", needsArtwork("REJECTED"), true);
eq("needsArtwork: APPROVED", needsArtwork("APPROVED"), false);

console.log("── payment rules (checkout gate + proof file) ──");
const full = { accountName: "Bhagini Graphics", bankName: null, accountNumber: "123456789012", ifsc: "HDFC0001234" };
eq("bank details complete with holder, number, IFSC", bankDetailsComplete(full), true);
eq("bank name is optional", bankDetailsComplete({ ...full, bankName: null }), true);
eq("missing holder blocks checkout", bankDetailsComplete({ ...full, accountName: null }), false);
eq("missing account number blocks checkout", bankDetailsComplete({ ...full, accountNumber: null }), false);
eq("missing IFSC blocks checkout", bankDetailsComplete({ ...full, ifsc: null }), false);
eq("empty-string holder blocks checkout", bankDetailsComplete({ ...full, accountName: "" }), false);
eq("PNG accepted", proofFileProblem({ size: 1000, type: "image/png" }), null);
eq("JPG accepted", proofFileProblem({ size: 1000, type: "image/jpeg" }), null);
eq("WebP accepted", proofFileProblem({ size: 1000, type: "image/webp" }), null);
eq("PDF accepted", proofFileProblem({ size: 1000, type: "application/pdf" }), null);
eq("exactly 10 MB accepted", proofFileProblem({ size: PROOF_MAX_BYTES, type: "image/png" }), null);
eq("empty file rejected", /empty/.test(proofFileProblem({ size: 0, type: "image/png" }) ?? ""), true);
eq("over 10 MB rejected", /too large/.test(proofFileProblem({ size: PROOF_MAX_BYTES + 1, type: "image/png" }) ?? ""), true);
eq("HEIC rejected (browsers can't show it to admin)", /PNG, JPG or WebP/.test(proofFileProblem({ size: 1000, type: "image/heic" }) ?? ""), true);
eq("text file rejected", proofFileProblem({ size: 10, type: "text/plain" }) !== null, true);
eq("missing type rejected", proofFileProblem({ size: 10, type: "" }) !== null, true);
eq("empty is reported before type", /empty/.test(proofFileProblem({ size: 0, type: "text/plain" }) ?? ""), true);
eq("UTR limit is 60", PROOF_REFERENCE_MAX, 60);

eq("UTR normalized: spaces and dashes", normalizeReference(" 4123 4567-8901 "), "412345678901");
eq("UTR normalized: 'UTR:' prefix and case", normalizeReference("utr: hdfcr5202609"), "HDFCR5202609");
eq("UTR normalized: 'UTR No.' label", normalizeReference("UTR No. 412345678901"), "412345678901");
eq("UTR normalized: 'Ref #' label", normalizeReference("Ref # 412345678901"), "412345678901");
eq("UTR normalized: label glued to digits", normalizeReference("UTR412345678901"), "412345678901");
eq("UTR normalized: letters that only look like a label survive", normalizeReference("REFX12345"), "REFX12345");
eq("UTR normalized: blank is null", normalizeReference("  - "), null);
eq("UTR normalized: missing is null", normalizeReference(undefined), null);
eq("UTR normalized: wildcard chars can't match everything", normalizeReference("%_%"), null);

console.log("── review pins the proof the admin saw ──");
eq("APPROVE with the viewed proofUrl ok", okParse(paymentReviewSchema, { action: "APPROVE", proofUrl: "/api/files/a.png" }), true);
eq("proofUrl stays optional", okParse(paymentReviewSchema, { action: "APPROVE" }), true);
eq("absurd proofUrl refused", okParse(paymentReviewSchema, { action: "APPROVE", proofUrl: "x".repeat(501) }), false);
eq("reason at the shared max ok", okParse(paymentReviewSchema, { action: "REJECT", reason: "r".repeat(REJECT_REASON_MAX) }), true);
eq("reason over the shared max refused", okParse(paymentReviewSchema, { action: "REJECT", reason: "r".repeat(REJECT_REASON_MAX + 1) }), false);

console.log("── signup approval ──");
eq("APPROVED account is not blocked", approvalBlock("APPROVED"), null);
eq("PENDING account is blocked with a wait message", /awaiting approval/.test(approvalBlock("PENDING") ?? ""), true);
eq("PENDING message gives a phone number to call", /\+91 72030 00701/.test(approvalBlock("PENDING") ?? ""), true);
eq("REJECTED account is blocked", approvalBlock("REJECTED") !== null, true);
eq("REJECTED message includes the admin's reason", /GST number does not match/.test(approvalBlock("REJECTED", "GST number does not match") ?? ""), true);
eq("REJECTED with no reason still reads as a full sentence", /wasn't approved\. /.test(approvalBlock("REJECTED", null) ?? ""), true);
eq("REJECTED with a blank reason is treated as no reason", /approved\. /.test(approvalBlock("REJECTED", "   ") ?? ""), true);
eq("an unrecognised status is blocked, never let through", approvalBlock("SOMETHING_ELSE") !== null && approvalBlock("") !== null, true);
eq("approvalBlock and isApproved agree on every status", ["APPROVED", "PENDING", "REJECTED", "X", ""].every((s) => (approvalBlock(s) === null) === isApproved(s)), true);
eq("only APPROVED may hold a session", [isApproved("APPROVED"), isApproved("PENDING"), isApproved("REJECTED"), isApproved("")], [true, false, false, false]);
eq("every status has a label and badge", Object.values(APPROVAL_STATUS).every((m) => m.label && m.badge && m.dot), true);
eq("approve needs no reason", okParse(signupReviewSchema, { action: "APPROVE" }), true);
eq("reject without a reason refused", okParse(signupReviewSchema, { action: "REJECT" }), false);
eq("reject with a 2-char reason refused", okParse(signupReviewSchema, { action: "REJECT", reason: "no" }), false);
eq("reject reason is trimmed before the length check", okParse(signupReviewSchema, { action: "REJECT", reason: "  ab  " }), false);
eq("reject with a real reason ok", okParse(signupReviewSchema, { action: "REJECT", reason: "Could not verify the business" }), true);
eq("reject reason over the max refused", okParse(signupReviewSchema, { action: "REJECT", reason: "r".repeat(APPROVAL_REASON_MAX + 1) }), false);
eq("unknown action refused", okParse(signupReviewSchema, { action: "MAYBE" }), false);

console.log("── order and invoice numbers ──");
eq("first order of the year", nextOrderNumber(2026, null), "BG-2026-00001");
eq("increments the last one", nextOrderNumber(2026, "BG-2026-00041"), "BG-2026-00042");
eq("max + 1 after deletions (was count + 1)", nextOrderNumber(2026, "BG-2026-00004"), "BG-2026-00005");
eq("past 99999 still increments", nextOrderNumber(2026, "BG-2026-99999"), "BG-2026-100000");
let threw = false;
try { nextOrderNumber(2026, "BG-2026-abc"); } catch { threw = true; }
eq("malformed suffix refused instead of restarting at 00001", threw, true);
threw = false;
try { nextOrderNumber(2026, "BG-2025-00007"); } catch { threw = true; }
eq("a different year's number is refused", threw, true);
// Invoices: own consecutive series per Indian financial year (Apr-Mar, IST).
eq("FY: 22 Sep 2026 is 26-27", financialYear(new Date("2026-09-22T10:00:00Z")), "26-27");
eq("FY: 31 Mar 2027 is still 26-27", financialYear(new Date("2027-03-31T12:00:00Z")), "26-27");
eq("FY: 1 Apr 2027 IST is 27-28", financialYear(new Date("2027-04-01T00:00:00+05:30")), "27-28");
eq("FY: 31 Mar 2027 23:00 UTC is already 1 Apr IST", financialYear(new Date("2027-03-31T23:00:00Z")), "27-28");
eq("FY: century rollover pads", financialYear(new Date("2099-06-01T00:00:00Z")), "99-00");
const sep26 = new Date("2026-09-22T10:00:00Z");
eq("first invoice of the FY", nextInvoiceNumber(sep26, null), "INV/26-27/00001");
eq("invoices are consecutive", nextInvoiceNumber(sep26, "INV/26-27/00007"), "INV/26-27/00008");
eq("invoice number fits GST's 16 characters", nextInvoiceNumber(sep26, "INV/26-27/99998").length <= 16, true);
threw = false;
try { nextInvoiceNumber(sep26, "INV-2026-00004"); } catch { threw = true; }
eq("an old-format number is not mistaken for this series", threw, true);

console.log("── status sets ──");
eq("legacy PAYMENT_CONFIRMED counts as in production", IN_PRODUCTION_STATUSES.includes("PAYMENT_CONFIRMED"), true);
eq("legacy PAYMENT_CONFIRMED is in the Active tab", ACTIVE_STATUSES.includes("PAYMENT_CONFIRMED"), true);
eq("unpaid orders are in the Active tab", ACTIVE_STATUSES.includes("PAYMENT_PENDING"), true);
eq("unpaid orders are not in production", IN_PRODUCTION_STATUSES.includes("PAYMENT_PENDING"), false);
eq("delivered is not active", ACTIVE_STATUSES.includes("DELIVERED"), false);
eq("cancelled is not active", ACTIVE_STATUSES.includes("CANCELLED"), false);
for (const s of Object.keys(ORDER_STATUS)) {
  eq(`isPaidStatus(${s}) agrees with the revenue filter`, isPaidStatus(s), !UNPAID_OR_VOID_STATUSES.includes(s as never));
}

console.log(`\n${fail === 0 ? "🎉 ALL PASS" : "💥 FAILURES"}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

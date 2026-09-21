// Pure checks for the order state machine after the bank-transfer change.
// Run: npx tsx scripts/test-order-status.ts
import {
  nextStatuses, isCancellable, ORDER_PIPELINE, CANCELLABLE_STATUSES,
  isPaidStatus, paymentStage, statusLabel,
} from "../src/lib/orderStatus";

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log(`${ok ? "✅" : "❌"} ${name}${ok ? "" : `\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`}`);
};

console.log("── pipeline ──");
eq("starts at Payment Pending", ORDER_PIPELINE[0], "PAYMENT_PENDING");
eq("Placed follows it", ORDER_PIPELINE[1], "PLACED");
eq("Payment Confirmed is retired from the pipeline", ORDER_PIPELINE.includes("PAYMENT_CONFIRMED"), false);

console.log("── transitions ──");
eq("PAYMENT_PENDING cannot be moved to PLACED by hand", nextStatuses("PAYMENT_PENDING"), ["CANCELLED"]);
eq("PLACED -> DESIGN_REVIEW or cancel", nextStatuses("PLACED"), ["DESIGN_REVIEW", "CANCELLED"]);
eq("DESIGN_REVIEW -> PRINTING or cancel", nextStatuses("DESIGN_REVIEW"), ["PRINTING", "CANCELLED"]);
eq("PRINTING cannot be cancelled", nextStatuses("PRINTING"), ["QUALITY_CHECK"]);
eq("OUT_FOR_DELIVERY -> DELIVERED", nextStatuses("OUT_FOR_DELIVERY"), ["DELIVERED"]);
eq("DELIVERED is terminal", nextStatuses("DELIVERED"), []);
eq("CANCELLED is terminal", nextStatuses("CANCELLED"), []);

console.log("── legacy PAYMENT_CONFIRMED (written by the old build) ──");
eq("legacy status advances like PLACED", nextStatuses("PAYMENT_CONFIRMED"), ["DESIGN_REVIEW", "CANCELLED"]);
eq("legacy status is cancellable", isCancellable("PAYMENT_CONFIRMED"), true);
eq("legacy status counts as paid", isPaidStatus("PAYMENT_CONFIRMED"), true);

console.log("── cancellation ──");
eq("cancellable set", CANCELLABLE_STATUSES, ["PAYMENT_PENDING", "PLACED", "PAYMENT_CONFIRMED", "DESIGN_REVIEW"]);
eq("unpaid order is cancellable", isCancellable("PAYMENT_PENDING"), true);
eq("printing order is not", isCancellable("PRINTING"), false);

console.log("── paid / revenue ──");
eq("unpaid is not paid", isPaidStatus("PAYMENT_PENDING"), false);
eq("cancelled is not paid", isPaidStatus("CANCELLED"), false);
eq("placed is paid", isPaidStatus("PLACED"), true);
eq("delivered is paid", isPaidStatus("DELIVERED"), true);

console.log("── payment stage ──");
eq("no payment row", paymentStage(null), "awaiting_proof");
eq("pending, no proof", paymentStage({ status: "PENDING", proofUrl: null }), "awaiting_proof");
eq("pending with proof", paymentStage({ status: "PENDING", proofUrl: "/api/files/x.png" }), "in_review");
eq("rejected", paymentStage({ status: "FAILED", proofUrl: "/api/files/x.png" }), "rejected");
eq("verified", paymentStage({ status: "SUCCESS", proofUrl: "/api/files/x.png" }), "verified");

console.log("── labels ──");
eq("label", statusLabel("PAYMENT_PENDING"), "Payment Pending");

console.log(`\n${fail === 0 ? "🎉 ALL PASS" : "💥 FAILURES"}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

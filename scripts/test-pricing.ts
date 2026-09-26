// Verifies the pricing engine against the real CMYK/sticker rate card.
// Run: node scripts/test-pricing.ts   (Node 24 strips TS types)
import { computePrice, computeTotals, type PricingInput } from "../src/lib/services/pricing.ts";

let pass = 0;
let fail = 0;

function near(a: number, b: number, eps = 0.02) {
  return Math.abs(a - b) <= eps;
}

function check(label: string, got: number, want: number) {
  const ok = near(got, want);
  console.log(`${ok ? "✅" : "❌"} ${label}: got ₹${got.toFixed(2)}, want ₹${want.toFixed(2)}`);
  if (ok) pass++;
  else fail++;
}

// A MATRIX product like CMYK printing (GST-inclusive rates, ₹20 single-print < 5).
const cmyk = {
  pricingModel: "MATRIX" as const,
  requiresDimensions: false,
  unitRate: null,
  minQuantity: 1,
  pricesIncludeGst: true,
  singlePrintThreshold: 5,
  singlePrintRate: 20,
};

function priceCmyk(rate: number | null, qty: number, addOns: PricingInput["addOns"] = [], delivery = 0) {
  return computePrice({
    product: cmyk,
    quantity: qty,
    addOns,
    matrixRate: rate,
    deliveryFee: delivery,
  });
}

console.log("── MATRIX: CMYK printing (GST-inclusive) ──");

// 12×18, 100gsm, 1 side = ₹8/sheet. 250 sheets → ₹2000 inclusive.
let b = priceCmyk(8, 250);
check("250 × ₹8 total (incl GST)", b.total, 2000);
check("  taxable back-calc", b.taxable, 2000 / 1.18);
check("  gst back-calc", b.gst, 2000 - 2000 / 1.18);

// 12×18, 100gsm, 2 side = ₹14. 100 sheets → ₹1400.
check("100 × ₹14", priceCmyk(14, 100).total, 1400);

// Single-print: 3 sheets < 5 → flat ₹20/sheet = ₹60 (rate ignored).
check("3 sheets single-print (₹20)", priceCmyk(8, 3).total, 60);

// Exactly at threshold (5) → matrix rate, not single-print. 5 × ₹8 = ₹40.
check("5 sheets at threshold → ₹8", priceCmyk(8, 5).total, 40);

// Lamination add-on: ₹180 per 100 sheets, proportional. 250 sheets → ₹450.
const lam = [{ addOnType: "PER_UNIT" as const, addOnValue: 180, perQuantity: 100 }];
b = priceCmyk(8, 250, lam);
check("250 × ₹8 + lamination ₹450", b.total, 2000 + 450);

// Sticker 13×19 Chromo = ₹13. 200 sheets → ₹2600.
check("sticker 200 × ₹13", priceCmyk(13, 200).total, 2600);

// With delivery ₹50 (taxable, +18% = ₹9). 100 × ₹8 = 800 incl + 50 + 9 = 859.
b = priceCmyk(8, 100, [], 50);
check("100 × ₹8 + delivery ₹50 (+GST)", b.total, 800 + 50 + 9);

// ── Cart/order totals + free-shipping threshold ──
// Regression guard: freeShippingThreshold DEFAULTS TO 0 in the database, so a
// naive `subtotal >= threshold` would waive delivery on every order ever placed.
console.log("\n── computeTotals: free-shipping threshold ──");
{
  const line = (lineSubtotal: number, gstAmount: number, deliveryFee: number) => ({
    lineSubtotal,
    gstAmount,
    deliveryFee,
  });

  // Threshold 0 = DISABLED. Delivery must still be charged.
  let t = computeTotals([line(1000, 180, 50)], 0.18, 0);
  check("threshold 0 → delivery still charged", t.deliveryCharge, 50);
  check("  total = 1000 + 50 + 180 + 9", t.total, 1239);
  console.log(`${t.shippingIsFree === false ? "✅" : "❌"}   shippingIsFree is false`);
  if (t.shippingIsFree !== false) fail++; else pass++;

  // Below the threshold → still charged.
  t = computeTotals([line(1000, 180, 50)], 0.18, 2000);
  check("subtotal 1000 < threshold 2000 → delivery charged", t.deliveryCharge, 50);

  // At the threshold → waived, and its GST goes with it.
  t = computeTotals([line(2000, 360, 50)], 0.18, 2000);
  check("subtotal 2000 = threshold 2000 → delivery waived", t.deliveryCharge, 0);
  check("  GST drops to goods-only (no delivery GST)", t.gst, 360);
  check("  total = 2000 + 360", t.total, 2360);

  // Above the threshold → waived.
  t = computeTotals([line(5000, 900, 120)], 0.18, 2000);
  check("subtotal above threshold → delivery waived", t.deliveryCharge, 0);

  // Mixed lines: GST-inclusive line (gstAmount already back-calculated) plus an
  // exclusive one must not double-tax.
  t = computeTotals([line(1694.92, 305.08, 0), line(1000, 180, 0)], 0.18, 0);
  check("mixed inclusive + exclusive lines", t.total, 3180);
}

console.log("\n── Letterhead card 2026-09 (flat totals per paper × slab, GST on top) ──");
const letterhead = { ...cmyk, pricesIncludeGst: false, singlePrintThreshold: null, singlePrintRate: null, minQuantity: 500 };
const CARD: [string, number | null, number][] = [
  ["A4 80 GSM", 900, 1200],
  ["A4 100 GSM", 1000, 1300],
  ["A4 100 GSM Alabaster", 1050, 1400],
  ["A4 100 GSM Bond", 1150, 1550],
  ["80 white + 60 yellow (500+500)", null, 1500],
];
for (const [paper, p500, p1000] of CARD) {
  for (const [qty, flat] of [[500, p500], [1000, p1000]] as const) {
    if (flat == null) continue;
    const r = computePrice({ product: letterhead, quantity: qty, addOns: [], deliveryFee: 0, matrixPrice: { flatPrice: flat } });
    check(`${paper} × ${qty}: base is the card price`, r.goodsTaxable, flat);
    check(`${paper} × ${qty}: + 18% GST`, r.total, Math.round(flat * 1.18 * 100) / 100);
  }
}

console.log(`\n${fail === 0 ? "🎉 ALL PASS" : "⚠️  FAILURES"}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

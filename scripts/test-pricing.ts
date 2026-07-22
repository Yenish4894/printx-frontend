// Verifies the pricing engine against the real CMYK/sticker rate card.
// Run: node scripts/test-pricing.ts   (Node 24 strips TS types)
import { computePrice, type PricingInput } from "../src/lib/services/pricing.ts";

let pass = 0;
let fail = 0;

function near(a: number, b: number, eps = 0.02) {
  return Math.abs(a - b) <= eps;
}

function check(label: string, got: number, want: number) {
  const ok = near(got, want);
  console.log(`${ok ? "✅" : "❌"} ${label}: got ₹${got.toFixed(2)}, want ₹${want.toFixed(2)}`);
  ok ? pass++ : fail++;
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
  quantityTiers: [],
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

console.log("\n── TIERED: visiting cards (GST added on top) ──");
const cards = {
  pricingModel: "TIERED" as const,
  requiresDimensions: false,
  unitRate: null,
  minQuantity: 100,
  pricesIncludeGst: false,
  singlePrintThreshold: null,
  singlePrintRate: null,
  quantityTiers: [
    { quantity: 100, basePrice: 299 },
    { quantity: 500, basePrice: 999 },
    { quantity: 1000, basePrice: 1699 },
  ],
};
// exact tier 500 → 999 + 18% GST = 1178.82
b = computePrice({ product: cards, quantity: 500, addOns: [], deliveryFee: 0 });
check("500 cards base", b.goodsTaxable, 999);
check("500 cards + 18% GST", b.total, round2(999 * 1.18));
// add-on FLAT ₹150 (premium lamination once) → (999+150) * 1.18
b = computePrice({
  product: cards,
  quantity: 500,
  addOns: [{ addOnType: "FLAT", addOnValue: 150, perQuantity: 1 }],
  deliveryFee: 0,
});
check("500 cards + ₹150 add-on + GST", b.total, round2((999 + 150) * 1.18));

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

console.log(`\n${fail === 0 ? "🎉 ALL PASS" : "⚠️  FAILURES"}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

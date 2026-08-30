// Verifies the flat-price MATRIX path against the REAL letterhead rate card
// (432 combinations captured from the supplier portal, scripts/letterhead_prices.csv).
//
// Each CSV row is one priced combination of Size × Finish × Printing × Binding ×
// Qty. Because quantity is a pricing dimension, the row's price is the whole-run
// total and must come back unmultiplied.
//
// Run: node scripts/test-letterhead-pricing.ts   (Node 24 strips TS types)
import { readFileSync } from "node:fs";
import path from "node:path";
import { computePrice, type PricingProduct } from "../src/lib/services/pricing.ts";

const GST = 0.18;

// Letterhead products: flat-priced matrix, GST added on top (unlike the
// GST-inclusive CMYK card), no per-sheet single-print floor.
const letterhead: PricingProduct = {
  pricingModel: "MATRIX",
  requiresDimensions: false,
  unitRate: null,
  minQuantity: 500,
  pricesIncludeGst: false,
  singlePrintThreshold: null,
  singlePrintRate: null,
  quantityTiers: [],
};

interface Row {
  paper: string;
  variant: string;
  size: string;
  finish: string;
  printing: string;
  binding: string;
  qty: number;
  price: number;
}

/** Minimal CSV reader — handles the quoted product names in the export. */
function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    const r = Object.fromEntries(head.map((h, i) => [h, cells[i]])) as Record<string, string>;
    return {
      paper: r.paper,
      variant: r.variant,
      size: r.size,
      finish: r.finish,
      printing: r.printing,
      binding: r.binding,
      qty: Number(r.qty),
      price: Number(r.price),
    };
  });
}

const csv = readFileSync(
  path.join(import.meta.dirname, "letterhead_prices.csv"),
  "utf8",
);
const rows = parseCsv(csv);

let pass = 0;
const failures: string[] = [];

for (const row of rows) {
  const bd = computePrice({
    product: letterhead,
    quantity: row.qty,
    addOns: [],
    // The whole combination — including qty — resolves to this one flat price.
    matrixPrice: { flatPrice: row.price },
    deliveryFee: 0,
    gstRate: GST,
  });

  const wantGst = Math.round(row.price * GST * 100) / 100;
  const wantTotal = Math.round((row.price + wantGst) * 100) / 100;

  const ok =
    bd.base === row.price &&
    bd.goodsTaxable === row.price &&
    Math.abs(bd.gst - wantGst) < 0.011 &&
    Math.abs(bd.total - wantTotal) < 0.011;

  if (ok) pass++;
  else {
    failures.push(
      `${row.paper} | ${row.size} ${row.finish} | ${row.printing} | ${row.binding} | qty ${row.qty}\n` +
        `    base    got ₹${bd.base} want ₹${row.price}\n` +
        `    gst     got ₹${bd.gst} want ₹${wantGst}\n` +
        `    total   got ₹${bd.total} want ₹${wantTotal}`,
    );
  }
}

console.log(`── Letterhead flat-price MATRIX (${rows.length} real combinations) ──`);
console.log(`✅ ${pass} priced exactly`);

// The point of flatPrice: a per-sheet rate cannot represent these. Show it.
console.log("\n── why flatPrice exists: per-sheet rate loses money ──");
for (const q of [1000, 3000, 12000]) {
  const row = rows.find(
    (r) => r.paper === "100 GSM Bond" && r.size === "A4" && r.binding === "Not Required" && r.qty === q,
  );
  if (!row) continue;
  const perSheet = Math.round((row.price / row.qty) * 100) / 100; // Decimal(10,2)
  const viaRate = computePrice({
    product: letterhead,
    quantity: q,
    addOns: [],
    matrixPrice: { ratePerSheet: perSheet },
    deliveryFee: 0,
    gstRate: GST,
  }).base;
  const drift = Math.round((viaRate - row.price) * 100) / 100;
  console.log(
    `  qty ${String(q).padStart(5)}: card ₹${row.price}  ` +
      `via ₹${perSheet}/sheet → ₹${viaRate}  drift ₹${drift > 0 ? "+" : ""}${drift}`,
  );
}

// Structural checks the card must satisfy for the model to be right.
console.log("\n── structural checks ──");
function check(label: string, ok: boolean) {
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  if (!ok) failures.push(label);
}

const bondA4 = rows.filter((r) => r.paper === "100 GSM Bond" && r.size === "A4");
const bondLetter = rows.filter((r) => r.paper === "100 GSM Bond" && r.size === "Letter");
check(
  "A4 and Letter price identically (size is a spec, not a price driver)",
  bondA4.every((a) => {
    const l = bondLetter.find(
      (b) => b.qty === a.qty && b.binding === a.binding && b.printing === a.printing,
    );
    return l ? l.price === a.price : true;
  }),
);

// Binding delta is ₹100/1000 but caps at ₹800 — not expressible as a PER_UNIT add-on.
const base1000 = bondA4.find((r) => r.qty === 1000 && r.binding === "Not Required")!.price;
const pad1000 = bondA4.find((r) => r.qty === 1000 && r.binding.startsWith("Pad"))!.price;
const base16k = bondA4.find((r) => r.qty === 16000 && r.binding === "Not Required")!.price;
const pad16k = bondA4.find((r) => r.qty === 16000 && r.binding.startsWith("Pad"))!.price;
const d1 = pad1000 - base1000;
const d16 = pad16k - base16k;
check(
  `binding delta is non-linear (₹${d1} @1000 vs ₹${d16} @16000, not ₹${d1 * 16}) → must be a matrix dimension`,
  d16 !== d1 * 16,
);

check(
  "only 100 GSM Deo offers Both Side printing",
  new Set(rows.filter((r) => r.printing === "Both Side").map((r) => r.paper)).size === 1,
);
check(
  "only 100 GSM Deo has UV / Foil finishes",
  new Set(rows.filter((r) => r.finish !== "Plain").map((r) => r.paper)).size === 1,
);
check(
  "only 100 GSM Deo sells a 500 slab",
  rows.filter((r) => r.qty === 500).every((r) => r.paper === "100 GSM Deo"),
);

if (failures.length) {
  console.log(`\n❌ ${failures.length} failure(s):\n`);
  for (const f of failures.slice(0, 10)) console.log(f + "\n");
  process.exit(1);
}
console.log("\n🎉 all letterhead pricing checks passed");

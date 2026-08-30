// Seeds the Letterhead product from Bhagini Graphics' own rate card.
//
//   LETTERHEAD — 210 × 297 mm (A4)
//   601  A4-80 GSM                    1 Side  1000        ₹1100
//   602  A4-100 GSM                   1 Side  1000        ₹1200
//   603  A4-100 Allabaster            1 Side  1000        ₹1250
//   604  A4-100 GSM Bond              1 Side  1000        ₹1400
//   605  A4-(80 white + 60 yellow)    1 Side  500 + 500   ₹1400
//
// Modelled as ONE product with three pricing dimensions — Paper × Printing ×
// Qty — and five flat-priced matrix rows. Printing and Qty each have a single
// option today; they exist as dimensions so adding "Both Side" or a 2000 slab
// later is a data change, not a schema change.
//
// Idempotent: ids are deterministic, and the product's spec system + matrix are
// rebuilt on every run. Safe to re-run against production.
// Uses the Neon SQL driver directly because `node prisma/seed.ts` cannot import
// the engine-free generated client (extensionless ESM specifiers).
//
// Run: node scripts/seed-letterheads.mjs
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const CAT = "lh_cat_letterheads";
const PROD = "lh_prod_a4";
const G = { paper: "lh_g_paper", printing: "lh_g_printing", qty: "lh_g_qty" };

const PAPERS = [
  { id: "lh_o_601", code: "601", name: "80 GSM", label: "A4-80 GSM", price: 1100, desc: null },
  { id: "lh_o_602", code: "602", name: "100 GSM", label: "A4-100 GSM", price: 1200, desc: null },
  { id: "lh_o_603", code: "603", name: "100 Allabaster", label: "A4-100 Allabaster", price: 1250, desc: null },
  { id: "lh_o_604", code: "604", name: "100 GSM Bond", label: "A4-100 GSM Bond", price: 1400, desc: null },
  {
    id: "lh_o_605", code: "605", name: "80 white + 60 yellow",
    label: "A4-(80 white + 60 yellow)", price: 1400,
    desc: "500 white + 500 yellow sheets",
  },
];
const O_PRINT_1SIDE = "lh_o_print_1side";
const O_QTY_1000 = "lh_o_qty_1000";

const comboKey = (ids) => [...ids].sort().join("|");

// ── Category ──────────────────────────────────────────────
await sql`
  INSERT INTO "Category" (id,name,slug,icon,"displayOrder","isActive","parentId")
  VALUES (${CAT},'Letterheads','letterheads','description',3,true,NULL)
  ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, "isActive"=true`;

// ── Product ───────────────────────────────────────────────
// GST is EXCLUSIVE on this card: ₹1400 for 100 GSM Bond against a ₹1169 + GST
// supplier cost only leaves a margin if the ₹1400 is pre-tax.
await sql`
  INSERT INTO "Product" (
    id,"categoryId",name,slug,description,"isActive","pricingModel","requiresDimensions",
    "minQuantity","maxQuantity","quantityStep","pricesIncludeGst","standardSizeLabel",
    "printTypeLabel","productionTime","basePriceFrom",badges,"fileFormats","createdAt","updatedAt")
  VALUES (
    ${PROD},${CAT},'Letterhead — A4','letterhead-a4',
    'Professional A4 letterheads (210 × 297 mm) printed on your choice of paper stock.',
    true,'MATRIX',false,1000,NULL,1,false,'210 × 297 mm (A4)','Single Side',
    'Within 48 hours from file upload',1100,ARRAY['BESTSELLER']::text[],
    ARRAY['PDF','AI','PSD','PNG']::text[],now(),now())
  ON CONFLICT (id) DO UPDATE SET
    "categoryId"=EXCLUDED."categoryId", name=EXCLUDED.name, description=EXCLUDED.description,
    "isActive"=true, "pricingModel"=EXCLUDED."pricingModel", "minQuantity"=EXCLUDED."minQuantity",
    "pricesIncludeGst"=EXCLUDED."pricesIncludeGst", "standardSizeLabel"=EXCLUDED."standardSizeLabel",
    "printTypeLabel"=EXCLUDED."printTypeLabel", "productionTime"=EXCLUDED."productionTime",
    "basePriceFrom"=EXCLUDED."basePriceFrom", "updatedAt"=now()`;

// ── Rebuild the spec system + matrix (cascade clears options/rules/rows) ──
await sql`DELETE FROM "PriceMatrix" WHERE "productId" = ${PROD}`;
await sql`DELETE FROM "SpecGroup"   WHERE "productId" = ${PROD}`;
await sql`DELETE FROM "DeliverySpeed" WHERE "productId" = ${PROD}`;

await sql`INSERT INTO "SpecGroup" (id,"productId",name,"selectionType","isPricingDimension","isQuantityDimension","isRequired",icon,"displayOrder","isActive")
          VALUES (${G.paper},${PROD},'Paper','SINGLE_SELECT',true,false,true,'layers',0,true)`;
await sql`INSERT INTO "SpecGroup" (id,"productId",name,"selectionType","isPricingDimension","isQuantityDimension","isRequired",icon,"displayOrder","isActive")
          VALUES (${G.printing},${PROD},'Printing','SINGLE_SELECT',true,false,true,'print',1,true)`;
await sql`INSERT INTO "SpecGroup" (id,"productId",name,"selectionType","isPricingDimension","isQuantityDimension","isRequired",icon,"displayOrder","isActive")
          VALUES (${G.qty},${PROD},'Qty.','SINGLE_SELECT',true,true,true,'reorder',2,true)`;

let order = 0;
for (const p of PAPERS) {
  await sql`
    INSERT INTO "SpecOption" (id,"specGroupId",name,description,"addOnType","addOnValue","perQuantity","isDefault","isActive","displayOrder","quantityValue",code)
    VALUES (${p.id},${G.paper},${p.name},${p.desc},'FLAT',0,1,${order === 0},true,${order},NULL,${p.code})`;
  order++;
}
await sql`INSERT INTO "SpecOption" (id,"specGroupId",name,description,"addOnType","addOnValue","perQuantity","isDefault","isActive","displayOrder","quantityValue",code)
          VALUES (${O_PRINT_1SIDE},${G.printing},'1 Side',NULL,'FLAT',0,1,true,true,0,NULL,NULL)`;
await sql`INSERT INTO "SpecOption" (id,"specGroupId",name,description,"addOnType","addOnValue","perQuantity","isDefault","isActive","displayOrder","quantityValue",code)
          VALUES (${O_QTY_1000},${G.qty},'1000',NULL,'FLAT',0,1,true,true,0,1000,NULL)`;

for (const p of PAPERS) {
  const ids = [p.id, O_PRINT_1SIDE, O_QTY_1000];
  await sql`
    INSERT INTO "PriceMatrix" (id,"productId","comboKey","optionIds","ratePerSheet","flatPrice","isActive","createdAt")
    VALUES (${"lh_m_" + p.code},${PROD},${comboKey(ids)},${[...ids].sort()},NULL,${p.price},true,now())`;
}

// Free standard delivery — the card quotes no delivery charge.
await sql`INSERT INTO "DeliverySpeed" (id,"productId",name,fee,"etaMinDays","etaMaxDays","isActive","displayOrder")
          VALUES ('lh_d_standard',${PROD},'Standard',0,2,3,true,0)`;

// ── Retire the placeholder from the original demo seed ──
const retired = await sql`
  UPDATE "Product" SET "isActive"=false, "updatedAt"=now()
  WHERE slug='letter-pad' AND "isActive"=true RETURNING slug`;

// ── Report ────────────────────────────────────────────────
const rows = await sql`
  SELECT o.code, o.name, pm."flatPrice"
  FROM "PriceMatrix" pm
  JOIN "SpecOption" o ON o.id = ANY(pm."optionIds") AND o."specGroupId" = ${G.paper}
  WHERE pm."productId" = ${PROD} ORDER BY o.code`;

console.log("── Letterhead — A4 seeded ──");
console.log("  code  paper                        price (ex-GST)");
for (const r of rows) {
  console.log(`  ${r.code}   ${r.name.padEnd(28)} ₹${Number(r.flatPrice).toFixed(2)}`);
}
console.log(`\n  ${rows.length} flat-price rows · GST added on top at checkout`);
console.log(retired.length ? `  retired stale product: ${retired[0].slug}` : "  (no stale letter-pad to retire)");

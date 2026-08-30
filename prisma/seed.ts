// Seed: super-admin, a demo customer, and Bhagini Graphics' real print products —
// CMYK Printing and Stickers, both MATRIX / GST-inclusive, priced per sheet from the
// official rate card.
//
// ⚠️ DESTRUCTIVE: this DELETES every user, order, product and category before
// re-creating demo data. It is a fresh-database tool, not an update. It will
// destroy the live letterhead catalogue and real orders if pointed at
// production — so it refuses to run against a database that already holds real
// data unless you explicitly force it.
//
// Run: npm run db:seed                 (safe — aborts if the DB has real data)
//      SEED_FORCE=1 npm run db:seed    (wipes anyway — you must mean it)
//
// Run with tsx, not bare node: the generated client uses extensionless ESM
// specifiers Node cannot resolve. `npm run db:seed` does this for you.
import "dotenv/config";
// Node-targeted client — the Cloudflare one cannot run outside Workers.
import { PrismaClient } from "../src/generated/prisma-node/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { buildComboKey } from "../src/lib/services/pricing.ts";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

// ── Rate card (₹/sheet, GST-inclusive) ──
// CMYK: Size → GSM → [1 side, 2 side]
const CMYK_RATES: Record<string, Record<string, [number, number]>> = {
  "12 × 18 inch": {
    "100 GSM": [8, 14],
    "130 GSM": [8, 14],
    "170 GSM": [9, 15],
    "210 GSM": [9.5, 16],
    "250 GSM": [10, 17],
    "300 GSM": [11, 18],
    "350 GSM": [13, 20],
    "Texture Paper": [23, 30],
  },
  "13 × 19 inch": {
    "100 GSM": [10, 15],
    "130 GSM": [10, 17],
    "170 GSM": [11, 18],
    "210 GSM": [11.5, 18],
    "250 GSM": [12, 19],
    "300 GSM": [13, 20],
    "350 GSM": [15, 22],
    // 13×19 has no Texture Paper row — that combo is simply unavailable.
  },
};
// Stickers (1 side only): Size → Material → ₹/sheet
const STICKER_RATES: Record<string, Record<string, number>> = {
  "12 × 18 inch": { Chromo: 11, "Avery Opaque": 22, "Avery Transparent": 22, Silver: 22, Golden: 35 },
  "13 × 19 inch": { Chromo: 13, "Avery Opaque": 24, "Avery Transparent": 24, Silver: 24 },
};

const SIZES = ["12 × 18 inch", "13 × 19 inch"];
const GSMS = ["100 GSM", "130 GSM", "170 GSM", "210 GSM", "250 GSM", "300 GSM", "350 GSM", "Texture Paper"];
const STICKER_MATERIALS = ["Chromo", "Avery Opaque", "Avery Transparent", "Silver", "Golden"];

/**
 * Refuse to wipe a database that looks like production. "Real data" = any order
 * ever placed, or any product this seed does not itself create. Both are things
 * the seed cannot put back.
 */
async function assertSafeToWipe() {
  if (process.env.SEED_FORCE === "1") {
    console.warn("⚠️  SEED_FORCE=1 — wiping regardless of existing data.");
    return;
  }
  const SEEDED_SLUGS = ["cmyk-printing", "stickers"];
  const [orders, foreignProducts] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { slug: { notIn: SEEDED_SLUGS } } }),
  ]);
  if (orders === 0 && foreignProducts === 0) return;

  const reasons = [
    orders > 0 ? `${orders} order${orders === 1 ? "" : "s"}` : null,
    foreignProducts > 0
      ? `${foreignProducts} product${foreignProducts === 1 ? "" : "s"} this seed did not create`
      : null,
  ].filter(Boolean);

  console.error(`
✋ Refusing to seed: this database holds real data.
   Found ${reasons.join(" and ")}.

   This seed DELETES all users, orders, products and categories.
   Running it here would destroy live data it cannot restore.

   • Fresh/dev database?  SEED_FORCE=1 npm run db:seed
   • Adding letterheads?  node scripts/seed-letterheads.mjs  (additive, idempotent)
`);
  process.exit(1);
}

async function main() {
  console.log("🌱 Seeding Bhagini Graphics…");
  await assertSafeToWipe();

  // ── Clean (dev only) — FK-safe order so the seed is re-runnable ──
  await prisma.notification.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.priceMatrix.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.walletSettings.deleteMany();
  await prisma.savedPaymentMethod.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const custHash = await bcrypt.hash("Test@1234", 10);

  await prisma.user.create({
    data: {
      businessName: "Bhagini Graphics",
      ownerName: "Super Admin",
      mobile: "9000000000",
      email: "admin@bhaginigraphics.co.in",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      businessName: "Sharma Printers",
      ownerName: "Rahul Sharma",
      mobile: "9812345678",
      email: "rahul@example.com",
      gstNumber: "27ABCDE1234F1Z5",
      passwordHash: custHash,
      role: "CUSTOMER",
      walletBalance: 5000,
      walletSettings: { create: {} },
      addresses: {
        create: {
          label: "Office",
          name: "Rahul Sharma",
          line1: "12 MG Road",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          phone: "9812345678",
          isDefault: true,
        },
      },
    },
  });

  // ── Category ──
  const printing = await prisma.category.create({
    data: { name: "Printing", slug: "printing", displayOrder: 1 },
  });

  const optId = (opts: { id: string; name: string }[], name: string) =>
    opts.find((o) => o.name === name)!.id;

  // ══════════════════════════════════════════════════════════════
  //  CMYK PRINTING — Size × GSM × Sides
  // ══════════════════════════════════════════════════════════════
  const cmyk = await prisma.product.create({
    data: {
      categoryId: printing.id,
      name: "CMYK Printing",
      slug: "cmyk-printing",
      description: "Full-colour offset sheet printing. Priced per sheet by size, paper GSM and sides. All rates are GST-inclusive. Please send curve-converted files.",
      pricingModel: "MATRIX",
      pricesIncludeGst: true,
      singlePrintThreshold: 5,
      singlePrintRate: 20,
      minQuantity: 1,
      printTypeLabel: "Full Colour (CMYK)",
      badges: ["BESTSELLER"],
    },
  });

  const cSize = await prisma.specGroup.create({
    data: {
      productId: cmyk.id, name: "Size", isPricingDimension: true, displayOrder: 1,
      options: { create: SIZES.map((n, i) => ({ name: n, displayOrder: i + 1 })) },
    },
    include: { options: true },
  });
  const cPaper = await prisma.specGroup.create({
    data: {
      productId: cmyk.id, name: "Paper", isPricingDimension: true, displayOrder: 2,
      options: { create: GSMS.map((n, i) => ({ name: n, displayOrder: i + 1 })) },
    },
    include: { options: true },
  });
  const cSides = await prisma.specGroup.create({
    data: {
      productId: cmyk.id, name: "Sides", isPricingDimension: true, displayOrder: 3,
      options: { create: [{ name: "Single Side", displayOrder: 1 }, { name: "Double Side", displayOrder: 2 }] },
    },
    include: { options: true },
  });
  // Finishing add-on (not a pricing dimension): lamination ₹180 per 100 sheets.
  await prisma.specGroup.create({
    data: {
      productId: cmyk.id, name: "Finishing", isRequired: false, displayOrder: 4,
      options: {
        create: [
          { name: "None", addOnType: "FLAT", addOnValue: 0, isDefault: true, displayOrder: 1 },
          { name: "Gloss / Matt Lamination", addOnType: "PER_UNIT", addOnValue: 180, perQuantity: 100, displayOrder: 2 },
        ],
      },
    },
  });

  const cmykRows: { comboKey: string; optionIds: string[]; ratePerSheet: number }[] = [];
  for (const size of SIZES) {
    for (const gsm of GSMS) {
      const rate = CMYK_RATES[size][gsm];
      if (!rate) continue; // e.g. 13×19 Texture — unavailable
      const sizeId = optId(cSize.options, size);
      const paperId = optId(cPaper.options, gsm);
      for (const [sideName, idx] of [["Single Side", 0], ["Double Side", 1]] as const) {
        const sideId = optId(cSides.options, sideName);
        const ids = [sizeId, paperId, sideId];
        cmykRows.push({ comboKey: buildComboKey(ids), optionIds: [...ids].sort(), ratePerSheet: rate[idx] });
      }
    }
  }
  await prisma.priceMatrix.createMany({ data: cmykRows.map((r) => ({ productId: cmyk.id, ...r })) });
  await prisma.deliverySpeed.createMany({
    data: [
      { productId: cmyk.id, name: "Standard", fee: 0, etaMinDays: 3, etaMaxDays: 5, displayOrder: 1 },
      { productId: cmyk.id, name: "Express", fee: 150, etaMinDays: 1, etaMaxDays: 2, displayOrder: 2 },
    ],
  });

  // ══════════════════════════════════════════════════════════════
  //  STICKERS — Size × Material (1 side)
  // ══════════════════════════════════════════════════════════════
  const stickers = await prisma.product.create({
    data: {
      categoryId: printing.id,
      name: "Stickers",
      slug: "stickers",
      description: "Single-side sticker printing across Chromo, Avery, Silver and Golden materials. Priced per sheet, GST-inclusive.",
      pricingModel: "MATRIX",
      pricesIncludeGst: true,
      singlePrintThreshold: 5,
      singlePrintRate: 20,
      minQuantity: 1,
      printTypeLabel: "Sticker (1 Side)",
      badges: ["POPULAR"],
    },
  });
  const sSize = await prisma.specGroup.create({
    data: {
      productId: stickers.id, name: "Size", isPricingDimension: true, displayOrder: 1,
      options: { create: SIZES.map((n, i) => ({ name: n, displayOrder: i + 1 })) },
    },
    include: { options: true },
  });
  const sMat = await prisma.specGroup.create({
    data: {
      productId: stickers.id, name: "Material", isPricingDimension: true, displayOrder: 2,
      options: { create: STICKER_MATERIALS.map((n, i) => ({ name: n, displayOrder: i + 1 })) },
    },
    include: { options: true },
  });
  await prisma.specGroup.create({
    data: {
      productId: stickers.id, name: "Finishing", isRequired: false, displayOrder: 3,
      options: {
        create: [
          { name: "None", addOnType: "FLAT", addOnValue: 0, isDefault: true, displayOrder: 1 },
          { name: "Gloss / Matt Lamination", addOnType: "PER_UNIT", addOnValue: 180, perQuantity: 100, displayOrder: 2 },
        ],
      },
    },
  });

  const stickerRows: { comboKey: string; optionIds: string[]; ratePerSheet: number }[] = [];
  for (const size of SIZES) {
    for (const mat of STICKER_MATERIALS) {
      const rate = STICKER_RATES[size][mat];
      if (rate == null) continue; // e.g. 13×19 Golden — unavailable
      const ids = [optId(sSize.options, size), optId(sMat.options, mat)];
      stickerRows.push({ comboKey: buildComboKey(ids), optionIds: [...ids].sort(), ratePerSheet: rate });
    }
  }
  await prisma.priceMatrix.createMany({ data: stickerRows.map((r) => ({ productId: stickers.id, ...r })) });
  await prisma.deliverySpeed.createMany({
    data: [
      { productId: stickers.id, name: "Standard", fee: 0, etaMinDays: 3, etaMaxDays: 5, displayOrder: 1 },
      { productId: stickers.id, name: "Express", fee: 150, etaMinDays: 1, etaMaxDays: 2, displayOrder: 2 },
    ],
  });

  console.log("✅ Seed complete");
  console.log(`   Admin:    9000000000 / Admin@123`);
  console.log(`   Customer: 9812345678 / Test@1234  (wallet ₹5000)`);
  console.log(`   CMYK Printing: ${cmykRows.length} rate rows (8 GSM × 2 sizes × 2 sides, minus 13×19 Texture)`);
  console.log(`   Stickers: ${stickerRows.length} rate rows (5 materials × 2 sizes, minus 13×19 Golden)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

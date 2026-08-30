-- Letterhead catalogue model.
--
-- Adds what the printersclub-style catalogue needs on top of the existing
-- schema: a category tree, product ordering bounds + identity fields, quantity
-- as a spec dimension, and flat-priced matrix rows.
--
-- Backwards compatible: every column is nullable or defaulted, and existing
-- MATRIX rows keep their ratePerSheet. CMYK / stickers are unaffected.

-- ── Category tree (top category → paper sub-category) ──
ALTER TABLE "Category" ADD COLUMN "parentId" TEXT;

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- ── Product: ordering bounds + catalogue identity ──
ALTER TABLE "Product" ADD COLUMN "maxQuantity" INTEGER;
ALTER TABLE "Product" ADD COLUMN "quantityStep" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Product" ADD COLUMN "additionalDesignCharge" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "productCode" TEXT;
ALTER TABLE "Product" ADD COLUMN "productClass" TEXT;
ALTER TABLE "Product" ADD COLUMN "productionTime" TEXT;

-- ── Quantity as a pricing dimension (fixed slab list) ──
ALTER TABLE "SpecGroup" ADD COLUMN "isQuantityDimension" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SpecOption" ADD COLUMN "quantityValue" INTEGER;

-- ── PriceMatrix: a row prices its combo per-sheet OR as a flat total ──
ALTER TABLE "PriceMatrix" ALTER COLUMN "ratePerSheet" DROP NOT NULL;
ALTER TABLE "PriceMatrix" ADD COLUMN "flatPrice" DECIMAL(10,2);

-- Exactly one pricing basis per row. Enforced in the DB as well as in
-- resolveAndPrice(), because a half-priced row silently sells at ₹0.
ALTER TABLE "PriceMatrix"
  ADD CONSTRAINT "PriceMatrix_one_price_basis"
  CHECK (("ratePerSheet" IS NOT NULL) <> ("flatPrice" IS NOT NULL));

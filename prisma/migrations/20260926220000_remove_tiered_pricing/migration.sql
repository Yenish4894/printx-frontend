-- Remove tiered pricing: nothing can enter quantity tiers, and the one TIERED
-- product (letter-pad) is inactive with no tiers. Letterheads use MATRIX.
UPDATE "Product" SET "pricingModel" = 'MATRIX' WHERE "pricingModel" = 'TIERED';

DROP TABLE "QuantityTier";

ALTER TYPE "PricingModel" RENAME TO "PricingModel_old";
CREATE TYPE "PricingModel" AS ENUM ('PER_UNIT', 'MATRIX');
ALTER TABLE "Product" ALTER COLUMN "pricingModel" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "pricingModel" TYPE "PricingModel" USING ("pricingModel"::text::"PricingModel");
ALTER TABLE "Product" ALTER COLUMN "pricingModel" SET DEFAULT 'MATRIX';
DROP TYPE "PricingModel_old";

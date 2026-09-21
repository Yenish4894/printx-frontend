-- Bank-transfer payments: checkout creates the order as PAYMENT_PENDING, the
-- customer uploads proof of transfer, an admin approves it and the order moves
-- to PLACED.
--
-- Additive only. The previously deployed build never writes the new values and
-- ignores the new columns, so this is safe to apply before the new build ships.
-- PAYMENT_CONFIRMED is deliberately NOT dropped here: the old build can still
-- write it from the admin status dropdown. Remove it in a follow-up migration
-- once this release is live.

ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING' BEFORE 'PLACED';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'BANK_TRANSFER' BEFORE 'WALLET';

ALTER TABLE "Payment"
  ADD COLUMN "proofUrl" TEXT,
  ADD COLUMN "proofName" TEXT,
  ADD COLUMN "proofUploadedAt" TIMESTAMP(3),
  ADD COLUMN "reference" TEXT,
  ADD COLUMN "rejectReason" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedById" TEXT;

CREATE INDEX "Payment_proofUrl_idx" ON "Payment"("proofUrl");

ALTER TABLE "PlatformSettings"
  ADD COLUMN "bankAccountName" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "bankAccountNumber" TEXT,
  ADD COLUMN "bankIfsc" TEXT,
  ADD COLUMN "bankUpiId" TEXT;

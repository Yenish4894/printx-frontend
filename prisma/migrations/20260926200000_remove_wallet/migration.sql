-- Remove the wallet completely (customers pay by bank transfer only).
-- DESTRUCTIVE: deletes the wallet ledger and per-customer wallet settings/balances
-- (test data only, no real money) and the retired Razorpay/UPI/card leftovers.
-- The two ORDER-side leftovers are remapped, not deleted: the one legacy WALLET
-- payment (a cancelled test order) becomes BANK_TRANSFER.

-- 1. Data that would violate the narrower enums
UPDATE "Payment" SET "method" = 'BANK_TRANSFER' WHERE "method" <> 'BANK_TRANSFER';
DELETE FROM "Payment" WHERE "purpose" = 'WALLET_TOPUP';
DELETE FROM "Notification" WHERE "type" = 'WALLET';
UPDATE "Order" SET "status" = 'PLACED' WHERE "status" = 'PAYMENT_CONFIRMED';
UPDATE "OrderStatusHistory" SET "status" = 'PLACED' WHERE "status" = 'PAYMENT_CONFIRMED';

-- 2. Tables and columns
DROP TABLE "WalletTransaction";
DROP TABLE "WalletSettings";
DROP TABLE "SavedPaymentMethod";
ALTER TABLE "User" DROP COLUMN "walletBalance";
ALTER TABLE "PlatformSettings" DROP COLUMN "minTopUp", DROP COLUMN "maxTopUp", DROP COLUMN "bankUpiId";
ALTER TABLE "Payment" DROP COLUMN "razorpayOrderId", DROP COLUMN "razorpayPaymentId";

-- 3. Narrow the enums (Postgres cannot drop an enum value in place)
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod" USING ("method"::text::"PaymentMethod");
DROP TYPE "PaymentMethod_old";

ALTER TYPE "PaymentPurpose" RENAME TO "PaymentPurpose_old";
CREATE TYPE "PaymentPurpose" AS ENUM ('ORDER');
ALTER TABLE "Payment" ALTER COLUMN "purpose" TYPE "PaymentPurpose" USING ("purpose"::text::"PaymentPurpose");
DROP TYPE "PaymentPurpose_old";

ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType" USING ("type"::text::"NotificationType");
ALTER TABLE "Notification" ALTER COLUMN "type" SET DEFAULT 'SYSTEM';
DROP TYPE "NotificationType_old";

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PAYMENT_PENDING', 'PLACED', 'DESIGN_REVIEW', 'PRINTING', 'QUALITY_CHECK', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::text::"OrderStatus");
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PLACED';
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::text::"OrderStatus");
DROP TYPE "OrderStatus_old";

DROP TYPE "WalletTxnType";

-- 4. The notification bell reads "my notifications, newest first"
DROP INDEX "Notification_userId_idx";
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- Admin approval for new customer signups.
--
-- Additive only. Every existing row (and every future row that does not set
-- the column, including staff a super admin creates and anything the
-- previously deployed build inserts) takes the APPROVED default, so nobody who
-- can sign in today loses access. Safe to apply before the new build ships.

CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "approvalReviewedAt" TIMESTAMP(3),
  ADD COLUMN "approvalReviewedById" TEXT,
  ADD COLUMN "approvalRejectReason" TEXT;

CREATE INDEX "User_role_approvalStatus_idx" ON "User"("role", "approvalStatus");

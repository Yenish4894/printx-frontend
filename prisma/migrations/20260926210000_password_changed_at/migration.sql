-- Sessions issued before a password change stop working (additive, nullable).
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

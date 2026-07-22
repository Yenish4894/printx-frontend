-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "gstPercent" INTEGER NOT NULL DEFAULT 18,
    "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "autoRoundPrices" BOOLEAN NOT NULL DEFAULT false,
    "minTopUp" DECIMAL(10,2) NOT NULL DEFAULT 200,
    "maxTopUp" DECIMAL(10,2) NOT NULL DEFAULT 100000,
    "cancellationWindowHours" INTEGER NOT NULL DEFAULT 2,
    "fileGracePeriod" BOOLEAN NOT NULL DEFAULT true,
    "defaultDpi" TEXT NOT NULL DEFAULT '300 DPI',
    "defaultColorProfile" TEXT NOT NULL DEFAULT 'CMYK (U.S. Web Coated)',
    "standardBleedMm" DECIMAL(4,1) NOT NULL DEFAULT 3,
    "businessGstNumber" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "socialFacebook" TEXT,
    "socialInstagram" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedin" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

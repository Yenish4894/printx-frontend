import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { SettingsInput } from "@/lib/dto/settings";

const SINGLETON = "singleton";
const num = (d: unknown) => Number(d);

export interface PlatformSettings {
  gstPercent: number;
  gstRate: number; // gstPercent / 100
  freeShippingThreshold: number;
  autoRoundPrices: boolean;
  minTopUp: number;
  maxTopUp: number;
  cancellationWindowHours: number;
  fileGracePeriod: boolean;
  defaultDpi: string;
  defaultColorProfile: string;
  standardBleedMm: number;
  businessGstNumber: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
}

/** Read the single settings row, creating it with defaults on first access. */
export async function getSettings(): Promise<PlatformSettings> {
  const s = await prisma.platformSettings.upsert({
    where: { id: SINGLETON },
    create: { id: SINGLETON },
    update: {},
  });
  return {
    gstPercent: s.gstPercent,
    gstRate: s.gstPercent / 100,
    freeShippingThreshold: num(s.freeShippingThreshold),
    autoRoundPrices: s.autoRoundPrices,
    minTopUp: num(s.minTopUp),
    maxTopUp: num(s.maxTopUp),
    cancellationWindowHours: s.cancellationWindowHours,
    fileGracePeriod: s.fileGracePeriod,
    defaultDpi: s.defaultDpi,
    defaultColorProfile: s.defaultColorProfile,
    standardBleedMm: num(s.standardBleedMm),
    businessGstNumber: s.businessGstNumber,
    supportPhone: s.supportPhone,
    supportEmail: s.supportEmail,
    socialFacebook: s.socialFacebook,
    socialInstagram: s.socialInstagram,
    socialTwitter: s.socialTwitter,
    socialLinkedin: s.socialLinkedin,
  };
}

/** Just the GST rate (fraction), used by the pricing path. Defaults to 0.18. */
export async function getGstRate(): Promise<number> {
  const s = await prisma.platformSettings.findUnique({ where: { id: SINGLETON } });
  return s ? s.gstPercent / 100 : 0.18;
}

export async function updateSettings(input: SettingsInput): Promise<PlatformSettings> {
  // Validate against the EFFECTIVE values (merge partial input over current).
  const current = await getSettings();
  const minTopUp = input.minTopUp ?? current.minTopUp;
  const maxTopUp = input.maxTopUp ?? current.maxTopUp;
  if (minTopUp > maxTopUp) {
    throw new HttpError(422, "Minimum top-up cannot exceed the maximum top-up");
  }
  await prisma.platformSettings.upsert({
    where: { id: SINGLETON },
    create: { id: SINGLETON, ...input },
    update: { ...input },
  });
  return getSettings();
}

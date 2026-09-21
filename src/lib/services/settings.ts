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
  bank: BankDetails;
}

// Bank details and the "complete enough to accept payment" rule are pure, so
// they live in paymentRules where npm test can reach them.
import type { BankDetails } from "@/lib/paymentRules";

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
    bank: {
      accountName: s.bankAccountName,
      bankName: s.bankName,
      accountNumber: s.bankAccountNumber,
      ifsc: s.bankIfsc,
      upiId: s.bankUpiId,
    },
  };
}

/** Just the GST rate (fraction), used by the pricing path. Defaults to 0.18. */
export async function getGstRate(): Promise<number> {
  const s = await prisma.platformSettings.findUnique({ where: { id: SINGLETON } });
  return s ? s.gstPercent / 100 : 0.18;
}

/** Settings fields that decide where customers send their money. */
const BANK_FIELDS = {
  bankAccountName: "accountName",
  bankName: "bankName",
  bankAccountNumber: "accountNumber",
  bankIfsc: "ifsc",
  bankUpiId: "upiId",
} as const satisfies Record<string, keyof BankDetails>;

const mask = (v: string | null | undefined) => (v ? `••${v.slice(-4)}` : "none");

/**
 * Save settings. The bank account customers pay into is the most valuable
 * setting in the app, so only a super admin may change it, and every change
 * notifies all super admins (who, and the old/new account's last 4 digits).
 * The settings page sends every field on each save, so "changed" is decided
 * by comparing with what is stored, not by which keys are present.
 */
export async function updateSettings(
  input: SettingsInput,
  actor: { id: string; mobile: string; role: string },
): Promise<PlatformSettings> {
  // Validate against the EFFECTIVE values (merge partial input over current).
  const current = await getSettings();
  const bankChanged = (Object.keys(BANK_FIELDS) as (keyof typeof BANK_FIELDS)[]).filter(
    (k) => input[k] !== undefined && (input[k] ?? null) !== (current.bank[BANK_FIELDS[k]] ?? null),
  );
  if (bankChanged.length && actor.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Only a super admin can change the bank account customers pay into.");
  }
  // Write only the bank fields that actually changed. The page resends every
  // field, so writing them all would let a save that read the settings just
  // before a super admin's bank change quietly put the old account back.
  for (const k of Object.keys(BANK_FIELDS) as (keyof typeof BANK_FIELDS)[]) {
    if (!bankChanged.includes(k)) delete input[k];
  }
  const minTopUp = input.minTopUp ?? current.minTopUp;
  const maxTopUp = input.maxTopUp ?? current.maxTopUp;
  if (minTopUp > maxTopUp) {
    throw new HttpError(422, "Minimum top-up cannot exceed the maximum top-up");
  }
  await prisma.$transaction(async (tx) => {
    await tx.platformSettings.upsert({
      where: { id: SINGLETON },
      create: { id: SINGLETON, ...input },
      update: { ...input },
    });
    if (!bankChanged.length) return;
    const acctBefore = current.bank.accountNumber;
    const acctAfter = input.bankAccountNumber === undefined ? acctBefore : input.bankAccountNumber;
    const supers = await tx.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { id: true } });
    await tx.notification.createMany({
      data: supers.map((u) => ({
        userId: u.id,
        type: "SYSTEM" as const,
        title: "Payment bank details changed",
        body:
          `Changed by ${actor.mobile}: ${bankChanged.map((k) => BANK_FIELDS[k]).join(", ")}. ` +
          `Account ${mask(acctBefore)} → ${mask(acctAfter)}. If this wasn't expected, check Settings now.`,
        link: "/admin/settings",
      })),
    });
  });
  return getSettings();
}

import { z } from "zod";

/** Optional text setting: trimmed, and "" means clear it (null). */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

export const settingsSchema = z.object({
  gstPercent: z.number().int().min(0).max(100).optional(),
  freeShippingThreshold: z.number().nonnegative().optional(),
  autoRoundPrices: z.boolean().optional(),
  cancellationWindowHours: z.number().int().min(0).optional(),
  fileGracePeriod: z.boolean().optional(),
  defaultDpi: z.string().max(40).optional(),
  defaultColorProfile: z.string().max(60).optional(),
  standardBleedMm: z.number().nonnegative().optional(),
  businessGstNumber: z.string().max(20).nullable().optional(),
  supportPhone: z.string().max(20).nullable().optional(),
  supportEmail: z.string().max(120).nullable().optional(),
  socialFacebook: z.string().max(200).nullable().optional(),
  socialInstagram: z.string().max(200).nullable().optional(),
  socialTwitter: z.string().max(200).nullable().optional(),
  socialLinkedin: z.string().max(200).nullable().optional(),

  // Bank account customers transfer to. Empty string clears a field. Formats are
  // checked because a typo here sends real money to the wrong place.
  bankAccountName: optionalText(100),
  bankName: optionalText(100),
  bankAccountNumber: optionalText(18).refine(
    (v) => v == null || /^\d{9,18}$/.test(v),
    "Account number must be 9 to 18 digits",
  ),
  bankIfsc: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v.toUpperCase()))
    .nullable()
    .optional()
    .refine((v) => v == null || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v), "IFSC must look like HDFC0001234"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ── Admin staff (ADMIN / SUPER_ADMIN users) ──
export const createStaffSchema = z.object({
  ownerName: z.string().min(1).max(80),
  businessName: z.string().min(1).max(120).optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export const updateStaffSchema = z.object({
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

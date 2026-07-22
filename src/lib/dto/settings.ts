import { z } from "zod";

export const settingsSchema = z.object({
  gstPercent: z.number().int().min(0).max(100).optional(),
  freeShippingThreshold: z.number().nonnegative().optional(),
  autoRoundPrices: z.boolean().optional(),
  minTopUp: z.number().nonnegative().optional(),
  maxTopUp: z.number().positive().optional(),
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

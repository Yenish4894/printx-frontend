import { z } from "zod";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ── Categories ──
export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(60).optional(),
  icon: z.string().max(60).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ── Products ──
const pricingModel = z.enum(["TIERED", "PER_UNIT", "MATRIX"]);
const unitType = z.enum(["PIECE", "SQ_FT", "SQ_CM", "SQ_INCH", "SQ_METER"]);

export const createProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  pricingModel,
  unitType: unitType.nullable().optional(),
  requiresDimensions: z.boolean().optional(),
  unitRate: z.number().nonnegative().nullable().optional(),
  minQuantity: z.number().int().positive().optional(),
  pricesIncludeGst: z.boolean().optional(),
  singlePrintThreshold: z.number().int().positive().nullable().optional(),
  singlePrintRate: z.number().nonnegative().nullable().optional(),
  badges: z.array(z.string()).optional(),
  printTypeLabel: z.string().max(120).nullable().optional(),
  standardSizeLabel: z.string().max(120).nullable().optional(),
  bleedArea: z.string().max(120).nullable().optional(),
  fileFormats: z.array(z.string()).optional(),
  basePriceFrom: z.number().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
});
export const updateProductSchema = createProductSchema.partial();

// ── Spec groups / options ──
export const specGroupSchema = z.object({
  name: z.string().min(1).max(80),
  selectionType: z.enum(["SINGLE_SELECT", "MULTI_SELECT"]).optional(),
  isPricingDimension: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  icon: z.string().max(60).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export const specOptionSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).nullable().optional(),
  addOnType: z.enum(["FLAT", "PER_UNIT"]).optional(),
  addOnValue: z.number().nonnegative().optional(),
  perQuantity: z.number().int().positive().optional(),
  isDefault: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ── Tiers / delivery (replace-all) ──
export const tiersSchema = z.object({
  tiers: z.array(
    z.object({
      quantity: z.number().int().positive(),
      basePrice: z.number().nonnegative(),
      label: z.string().max(60).nullable().optional(),
    }),
  ),
});
export const deliverySchema = z.object({
  speeds: z.array(
    z.object({
      name: z.string().min(1).max(60),
      fee: z.number().nonnegative(),
      etaMinDays: z.number().int().min(0),
      etaMaxDays: z.number().int().min(0),
    }),
  ),
});

// ── Price matrix (replace-all) ──
export const matrixSchema = z.object({
  rows: z.array(
    z.object({
      optionIds: z.array(z.string().min(1)).min(1),
      ratePerSheet: z.number().nonnegative(),
    }),
  ),
});

// ── Orders ──
export const orderStatusSchema = z.object({
  status: z.enum([
    "PLACED",
    "PAYMENT_CONFIRMED",
    "DESIGN_REVIEW",
    "PRINTING",
    "QUALITY_CHECK",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().max(300).optional(),
});
export const fileReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().max(300).optional(),
});

// ── Customers ──
export const customerUpdateSchema = z.object({
  isActive: z.boolean().optional(),
});
export const walletAdjustSchema = z.object({
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
  note: z.string().max(200).optional(),
});

// ── Refunds ──
export const refundProcessSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().max(200).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type SpecGroupInput = z.infer<typeof specGroupSchema>;
export type SpecOptionInput = z.infer<typeof specOptionSchema>;
export type TiersInput = z.infer<typeof tiersSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type MatrixInput = z.infer<typeof matrixSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type FileReviewInput = z.infer<typeof fileReviewSchema>;
export type WalletAdjustInput = z.infer<typeof walletAdjustSchema>;
export type RefundProcessInput = z.infer<typeof refundProcessSchema>;

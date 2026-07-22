// ─────────────────────────────────────────────────────────────
// Authoritative pricing engine (pure functions — no DB, no I/O).
// Supports three product pricing modes:
//   TIERED    base by quantity tier (+ bulk-rate interpolation)
//   PER_UNIT  unitRate × units (pcs / area)
//   MATRIX    rate looked up per option-combination × sheets (CMYK / stickers)
// Add-ons: FLAT (once) or PER_UNIT (× units / perQuantity, e.g. ₹180 per 100).
// GST 18%: added on top for exclusive products; back-calculated for GST-inclusive
// (MATRIX) products. Delivery is always a taxable service (+18%).
// ─────────────────────────────────────────────────────────────

export const GST_RATE = 0.18;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Normalized key for a MATRIX price row / lookup (order-independent). */
export const buildComboKey = (optionIds: string[]) =>
  [...optionIds].sort().join("|");

export type PricingModel = "TIERED" | "PER_UNIT" | "MATRIX";
export type AddOnType = "FLAT" | "PER_UNIT";

export interface QuantityTierLite {
  quantity: number;
  basePrice: number;
}

export interface PricingProduct {
  pricingModel: PricingModel;
  requiresDimensions: boolean;
  unitRate: number | null; // PER_UNIT
  minQuantity: number;
  pricesIncludeGst: boolean; // MATRIX rates already include GST
  singlePrintThreshold: number | null; // qty below this → flat singlePrintRate
  singlePrintRate: number | null;
  quantityTiers: QuantityTierLite[];
}

export interface AddOnLite {
  addOnType: AddOnType;
  addOnValue: number;
  perQuantity: number; // PER_UNIT charged per N units (1 = per sheet, 100 = per 100)
}

export interface PricingInput {
  product: PricingProduct;
  quantity: number;
  width?: number | null;
  height?: number | null;
  addOns: AddOnLite[]; // NON pricing-dimension options only
  matrixRate?: number | null; // resolved ₹/sheet for the dimension combo (MATRIX)
  deliveryFee: number;
  gstRate?: number; // fraction (e.g. 0.18); defaults to GST_RATE
}

export interface PriceBreakdown {
  units: number;
  base: number;
  addOns: number;
  delivery: number;
  goodsTaxable: number; // pre-GST value of base+add-ons
  goodsGst: number;
  deliveryGst: number;
  taxable: number; // goodsTaxable + delivery
  gst: number; // goodsGst + deliveryGst
  total: number; // customer-facing grand total
  gstInclusive: boolean;
}

/** Billable units: area×qty for dimension products, else the quantity. */
export function computeUnits(
  product: PricingProduct,
  quantity: number,
  width?: number | null,
  height?: number | null,
): number {
  if (product.requiresDimensions && width && height) {
    return round2(width * height * quantity);
  }
  return quantity;
}

export function computeBase(
  product: PricingProduct,
  quantity: number,
  units: number,
  matrixRate?: number | null,
): number {
  if (product.pricingModel === "MATRIX") {
    const small =
      product.singlePrintThreshold != null &&
      product.singlePrintRate != null &&
      quantity < product.singlePrintThreshold;
    const rate = small ? product.singlePrintRate! : (matrixRate ?? 0);
    return round2(rate * quantity);
  }

  if (product.pricingModel === "PER_UNIT") {
    return round2((product.unitRate ?? 0) * units);
  }

  // TIERED
  const tiers = [...product.quantityTiers].sort((a, b) => a.quantity - b.quantity);
  if (tiers.length === 0) return 0;
  const exact = tiers.find((t) => t.quantity === quantity);
  if (exact) return round2(exact.basePrice);
  let rate = tiers[0].basePrice / tiers[0].quantity;
  for (const t of tiers) if (quantity >= t.quantity) rate = t.basePrice / t.quantity;
  return round2(rate * quantity);
}

/** Add-ons: FLAT once, PER_UNIT × (units / perQuantity). */
export function computeAddOns(addOns: AddOnLite[], units: number): number {
  let total = 0;
  for (const a of addOns) {
    if (a.addOnType === "PER_UNIT") {
      const per = a.perQuantity > 0 ? a.perQuantity : 1;
      total += a.addOnValue * (units / per);
    } else {
      total += a.addOnValue;
    }
  }
  return round2(total);
}

export function computePrice(input: PricingInput): PriceBreakdown {
  const { product, quantity, width, height, addOns, matrixRate, deliveryFee } = input;
  const gstRate = input.gstRate ?? GST_RATE;

  const units = computeUnits(product, quantity, width, height);
  const base = computeBase(product, quantity, units, matrixRate);
  const addOnTotal = computeAddOns(addOns, units);
  const delivery = round2(deliveryFee);

  const goods = round2(base + addOnTotal);
  let goodsTaxable: number;
  let goodsGst: number;
  if (product.pricesIncludeGst) {
    goodsTaxable = round2(goods / (1 + gstRate));
    goodsGst = round2(goods - goodsTaxable);
  } else {
    goodsTaxable = goods;
    goodsGst = round2(goods * gstRate);
  }

  // Delivery is a taxable service (GST added on top regardless of product mode).
  const deliveryGst = round2(delivery * gstRate);

  const taxable = round2(goodsTaxable + delivery);
  const gst = round2(goodsGst + deliveryGst);
  const total = round2(taxable + gst);

  return {
    units,
    base,
    addOns: addOnTotal,
    delivery,
    goodsTaxable,
    goodsGst,
    deliveryGst,
    taxable,
    gst,
    total,
    gstInclusive: product.pricesIncludeGst,
  };
}

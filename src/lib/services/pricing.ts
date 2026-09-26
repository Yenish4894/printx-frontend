// ─────────────────────────────────────────────────────────────
// Authoritative pricing engine (pure functions — no DB, no I/O).
// Supports two product pricing modes:
//   PER_UNIT  unitRate × units (pcs / area)
//   MATRIX    price looked up per option-combination — either a ₹/sheet rate
//             × sheets (CMYK / stickers) or a flat total for the whole run when
//             quantity is itself a pricing dimension (letterheads)
// Add-ons: FLAT (once) or PER_UNIT (× units / perQuantity, e.g. ₹180 per 100).
// GST 18%: added on top for exclusive products; back-calculated for GST-inclusive
// (MATRIX) products. Delivery is always a taxable service (+18%).
// ─────────────────────────────────────────────────────────────

const GST_RATE = 0.18;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Normalized key for a MATRIX price row / lookup (order-independent). */
export const buildComboKey = (optionIds: string[]) =>
  [...optionIds].sort().join("|");

type PricingModel = "PER_UNIT" | "MATRIX";
type AddOnType = "FLAT" | "PER_UNIT";

export interface PricingProduct {
  pricingModel: PricingModel;
  requiresDimensions: boolean;
  unitRate: number | null; // PER_UNIT
  minQuantity: number;
  pricesIncludeGst: boolean; // MATRIX rates already include GST
  singlePrintThreshold: number | null; // qty below this → flat singlePrintRate
  singlePrintRate: number | null;
}

/**
 * The resolved MATRIX row for the selected combination. Exactly one of the two
 * prices is set — see the PriceMatrix model comment.
 *   ratePerSheet → base = rate × quantity   (CMYK / stickers)
 *   flatPrice    → base = flatPrice         (letterheads; quantity is itself a
 *                                            pricing dimension of the combo)
 */
export interface MatrixPrice {
  ratePerSheet?: number | null;
  flatPrice?: number | null;
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
  matrixRate?: number | null; // shorthand for matrixPrice: { ratePerSheet }
  matrixPrice?: MatrixPrice | null; // resolved MATRIX row for the dimension combo
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
function computeUnits(
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

function computeBase(
  product: PricingProduct,
  quantity: number,
  units: number,
  matrix?: MatrixPrice | null,
): number {
  if (product.pricingModel === "MATRIX") {
    // Flat-priced combination: the row already prices the whole run, so it is
    // NOT multiplied by quantity (quantity is one of the combo's dimensions).
    // The single-print floor is a per-sheet concept and does not apply here.
    if (matrix?.flatPrice != null) return round2(matrix.flatPrice);

    const small =
      product.singlePrintThreshold != null &&
      product.singlePrintRate != null &&
      quantity < product.singlePrintThreshold;
    const rate = small ? product.singlePrintRate! : (matrix?.ratePerSheet ?? 0);
    return round2(rate * quantity);
  }

  // PER_UNIT
  return round2((product.unitRate ?? 0) * units);
}

/** Add-ons: FLAT once, PER_UNIT × (units / perQuantity). */
function computeAddOns(addOns: AddOnLite[], units: number): number {
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
  const { product, quantity, width, height, addOns, deliveryFee } = input;
  const gstRate = input.gstRate ?? GST_RATE;
  const matrix: MatrixPrice | null =
    input.matrixPrice ??
    (input.matrixRate != null ? { ratePerSheet: input.matrixRate } : null);

  const units = computeUnits(product, quantity, width, height);
  const base = computeBase(product, quantity, units, matrix);
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

// ───────────────────────── Cart / order totals ─────────────────────────

export interface LineLike {
  lineSubtotal: number; // goods taxable (pre-GST value of base + add-ons)
  gstAmount: number; // GST on the goods (0 for none; back-calculated for inclusive)
  deliveryFee: number;
}

/**
 * Cart/order totals. Each line stores its own taxable value + GST (so GST-inclusive
 * MATRIX lines and GST-exclusive additive lines mix correctly). Delivery is a
 * taxable service — GST added on top.
 */
export function computeTotals(
  lines: LineLike[],
  gstRate = GST_RATE,
  freeShippingThreshold = 0,
) {
  const subtotal = round2(lines.reduce((s, l) => s + l.lineSubtotal, 0));
  const goodsGst = round2(lines.reduce((s, l) => s + l.gstAmount, 0));

  // Free delivery over a spend threshold. A threshold of 0 means DISABLED, not
  // "everything ships free" — the column defaults to 0, so treating it as a
  // real threshold would waive every delivery charge on the platform.
  const grossDelivery = round2(lines.reduce((s, l) => s + l.deliveryFee, 0));
  const shippingIsFree = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const deliveryCharge = shippingIsFree ? 0 : grossDelivery;

  const deliveryGst = round2(deliveryCharge * gstRate);
  const gst = round2(goodsGst + deliveryGst);
  const total = round2(subtotal + deliveryCharge + gst);
  return { subtotal, deliveryCharge, gst, total, shippingIsFree };
}

import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { computePrice, buildComboKey, type AddOnLite } from "./pricing";
import { getGstRate } from "./settings";
import type { QuoteInput } from "@/lib/dto/pricing";

/**
 * Loads the product, validates the selected config against its spec system,
 * resolves add-ons + (for MATRIX products) the ₹/sheet rate from the price
 * matrix + delivery, and runs the authoritative pricing engine.
 * Returns a priced breakdown + a resolved snapshot (for cart/order storage).
 */
export async function resolveAndPrice(input: QuoteInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: {
      specGroups: {
        where: { isActive: true },
        include: { options: { where: { isActive: true } } },
      },
      quantityTiers: { where: { isActive: true } },
      deliverySpeeds: { where: { isActive: true } },
      priceMatrix: { where: { isActive: true } },
    },
  });

  if (!product || !product.isActive) {
    throw new HttpError(404, "Product not found");
  }
  if (input.quantity < product.minQuantity) {
    throw new HttpError(422, `Minimum quantity is ${product.minQuantity}`);
  }
  if (product.requiresDimensions && (!input.width || !input.height)) {
    throw new HttpError(422, "Width and height are required for this product");
  }

  // Index options by id (with their group) for validation + resolution.
  const optionIndex = new Map<
    string,
    {
      groupId: string;
      isDimension: boolean;
      addOnType: AddOnLite["addOnType"];
      addOnValue: number;
      perQuantity: number;
      name: string;
      groupName: string;
    }
  >();
  for (const g of product.specGroups) {
    for (const o of g.options) {
      optionIndex.set(o.id, {
        groupId: g.id,
        isDimension: g.isPricingDimension,
        addOnType: o.addOnType,
        addOnValue: Number(o.addOnValue),
        perQuantity: o.perQuantity,
        name: o.name,
        groupName: g.name,
      });
    }
  }

  const addOns: AddOnLite[] = [];
  const dimensionOptionIds: string[] = [];
  const snapshot: { group: string; option: string; addOn: number }[] = [];

  for (const g of product.specGroups) {
    const sel = input.selections[g.id];
    const ids = sel == null ? [] : Array.isArray(sel) ? sel : [sel];

    if (g.isRequired && ids.length === 0) {
      throw new HttpError(422, `Please select an option for "${g.name}"`);
    }
    if (g.selectionType === "SINGLE_SELECT" && ids.length > 1) {
      throw new HttpError(422, `Only one option can be selected for "${g.name}"`);
    }

    for (const id of ids) {
      const opt = optionIndex.get(id);
      if (!opt || opt.groupId !== g.id) {
        throw new HttpError(422, `Invalid option selected for "${g.name}"`);
      }
      snapshot.push({ group: opt.groupName, option: opt.name, addOn: opt.addOnValue });
      if (opt.isDimension) {
        dimensionOptionIds.push(id);
      } else {
        addOns.push({
          addOnType: opt.addOnType,
          addOnValue: opt.addOnValue,
          perQuantity: opt.perQuantity,
        });
      }
    }
  }

  // MATRIX: resolve ₹/sheet for the selected dimension combination.
  let matrixRate: number | null = null;
  if (product.pricingModel === "MATRIX") {
    const comboKey = buildComboKey(dimensionOptionIds);
    const entry = product.priceMatrix.find((m) => m.comboKey === comboKey);
    if (!entry) {
      throw new HttpError(
        422,
        "This combination is not available. Please choose a different option.",
      );
    }
    matrixRate = Number(entry.ratePerSheet);
  }

  // Delivery
  let deliveryFee = 0;
  let deliveryLabel: string | null = null;
  if (input.deliverySpeedId) {
    const d = product.deliverySpeeds.find((x) => x.id === input.deliverySpeedId);
    if (!d) throw new HttpError(422, "Invalid delivery option");
    deliveryFee = Number(d.fee);
    deliveryLabel = d.name;
  }

  const gstRate = await getGstRate();

  const breakdown = computePrice({
    product: {
      pricingModel: product.pricingModel,
      requiresDimensions: product.requiresDimensions,
      unitRate: product.unitRate ? Number(product.unitRate) : null,
      minQuantity: product.minQuantity,
      pricesIncludeGst: product.pricesIncludeGst,
      singlePrintThreshold: product.singlePrintThreshold,
      singlePrintRate: product.singlePrintRate ? Number(product.singlePrintRate) : null,
      quantityTiers: product.quantityTiers.map((t) => ({
        quantity: t.quantity,
        basePrice: Number(t.basePrice),
      })),
    },
    quantity: input.quantity,
    width: input.width ?? null,
    height: input.height ?? null,
    addOns,
    matrixRate,
    deliveryFee,
    gstRate,
  });

  return {
    productId: product.id,
    quantity: input.quantity,
    deliveryLabel,
    specSnapshot: snapshot,
    breakdown,
  };
}

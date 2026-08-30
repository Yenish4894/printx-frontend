import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const num = (d: Prisma.Decimal | null | undefined) =>
  d == null ? null : Number(d);

// ── Product card (listing) ──
export async function listProducts(categorySlug?: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: { include: { parent: { select: { slug: true, name: true } } } },
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: {
      slug: p.category.slug,
      name: p.category.name,
      parent: p.category.parent
        ? { slug: p.category.parent.slug, name: p.category.parent.name }
        : null,
    },
    badges: p.badges,
    priceFrom: num(p.basePriceFrom),
    image: p.images[0]?.url ?? null,
  }));
}

// ── Full product (configurator) ──
export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      specGroups: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          options: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      quantityTiers: {
        where: { isActive: true },
        orderBy: { quantity: "asc" },
      },
      deliverySpeeds: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
      visibilityRules: { include: { conditions: true } },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: { slug: p.category.slug, name: p.category.name },
    pricingModel: p.pricingModel,
    unitType: p.unitType,
    requiresDimensions: p.requiresDimensions,
    unitRate: num(p.unitRate),
    minQuantity: p.minQuantity,
    maxQuantity: p.maxQuantity,
    quantityStep: p.quantityStep,
    productCode: p.productCode,
    productClass: p.productClass,
    productionTime: p.productionTime,
    pricesIncludeGst: p.pricesIncludeGst,
    singlePrintThreshold: p.singlePrintThreshold,
    singlePrintRate: num(p.singlePrintRate),
    badges: p.badges,
    printTypeLabel: p.printTypeLabel,
    standardSizeLabel: p.standardSizeLabel,
    bleedArea: p.bleedArea,
    fileFormats: p.fileFormats,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    specGroups: p.specGroups.map((g) => ({
      id: g.id,
      name: g.name,
      selectionType: g.selectionType,
      isRequired: g.isRequired,
      isPricingDimension: g.isPricingDimension,
      isQuantityDimension: g.isQuantityDimension,
      icon: g.icon,
      options: g.options.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        addOnType: o.addOnType,
        addOnValue: num(o.addOnValue) ?? 0,
        perQuantity: o.perQuantity,
        isDefault: o.isDefault,
        quantityValue: o.quantityValue,
        code: o.code,
      })),
    })),
    quantityTiers: p.quantityTiers.map((t) => ({
      id: t.id,
      quantity: t.quantity,
      basePrice: num(t.basePrice) ?? 0,
      label: t.label,
    })),
    deliverySpeeds: p.deliverySpeeds.map((d) => ({
      id: d.id,
      name: d.name,
      fee: num(d.fee) ?? 0,
      etaMinDays: d.etaMinDays,
      etaMaxDays: d.etaMaxDays,
    })),
    visibilityRules: p.visibilityRules.map((r) => ({
      id: r.id,
      targetType: r.targetType,
      targetGroupId: r.targetGroupId,
      targetOptionId: r.targetOptionId,
      logic: r.logic,
      conditions: r.conditions.map((c) => ({
        sourceGroupId: c.sourceGroupId,
        operator: c.operator,
        optionIds: c.optionIds,
      })),
    })),
  };
}

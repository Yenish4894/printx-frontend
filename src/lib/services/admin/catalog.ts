import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { buildComboKey } from "@/lib/services/pricing";
import { slugify } from "@/lib/dto/admin";
import type {
  CategoryInput,
  CreateProductInput,
  UpdateProductInput,
  SpecGroupInput,
  SpecOptionInput,
  TiersInput,
  DeliveryInput,
  MatrixInput,
} from "@/lib/dto/admin";

const num = (d: unknown) => (d == null ? null : Number(d));

// ───────────────────────── Categories ─────────────────────────

export async function listCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    productCount: c._count.products,
  }));
}

export async function createCategory(input: CategoryInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) throw new HttpError(422, "A category with this slug already exists");
  const c = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      icon: input.icon ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
  return { id: c.id };
}

export async function updateCategory(id: string, input: CategoryInput) {
  await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.slug ? { slug: slugify(input.slug) } : {}),
      icon: input.icon ?? undefined,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
  return { id };
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new HttpError(422, "Move or delete this category's products first");
  }
  await prisma.category.delete({ where: { id } });
  return { id };
}

// ───────────────────────── Products ─────────────────────────

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { specGroups: true, priceMatrix: true, orderItems: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    pricingModel: p.pricingModel,
    isActive: p.isActive,
    specGroups: p._count.specGroups,
    matrixRows: p._count.priceMatrix,
    orderCount: p._count.orderItems,
  }));
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "product";
  let i = 1;
  // ensure uniqueness
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const hit = await prisma.product.findUnique({ where: { slug } });
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new HttpError(422, "Invalid category");
  const slug = await uniqueSlug(input.slug ? slugify(input.slug) : slugify(input.name));
  const p = await prisma.product.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description ?? null,
      pricingModel: input.pricingModel,
      unitType: input.unitType ?? null,
      requiresDimensions: input.requiresDimensions ?? false,
      unitRate: input.unitRate ?? null,
      minQuantity: input.minQuantity ?? 1,
      pricesIncludeGst: input.pricesIncludeGst ?? false,
      singlePrintThreshold: input.singlePrintThreshold ?? null,
      singlePrintRate: input.singlePrintRate ?? null,
      badges: input.badges ?? [],
      printTypeLabel: input.printTypeLabel ?? null,
      standardSizeLabel: input.standardSizeLabel ?? null,
      bleedArea: input.bleedArea ?? null,
      fileFormats: input.fileFormats ?? [],
      basePriceFrom: input.basePriceFrom ?? null,
      isActive: input.isActive ?? true,
    },
  });
  return { id: p.id, slug: p.slug };
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Product not found");
  const slug = input.slug ? await uniqueSlug(slugify(input.slug), id) : undefined;
  await prisma.product.update({
    where: { id },
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description ?? undefined,
      pricingModel: input.pricingModel,
      unitType: input.unitType ?? undefined,
      requiresDimensions: input.requiresDimensions,
      unitRate: input.unitRate ?? undefined,
      minQuantity: input.minQuantity,
      pricesIncludeGst: input.pricesIncludeGst,
      singlePrintThreshold: input.singlePrintThreshold ?? undefined,
      singlePrintRate: input.singlePrintRate ?? undefined,
      badges: input.badges,
      printTypeLabel: input.printTypeLabel ?? undefined,
      standardSizeLabel: input.standardSizeLabel ?? undefined,
      bleedArea: input.bleedArea ?? undefined,
      fileFormats: input.fileFormats,
      basePriceFrom: input.basePriceFrom ?? undefined,
      isActive: input.isActive,
    },
  });
  return { id };
}

export async function deleteProduct(id: string) {
  const count = await prisma.orderItem.count({ where: { productId: id } });
  if (count > 0) {
    // preserve order history — deactivate instead of hard delete
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return { id, softDeleted: true };
  }
  await prisma.product.delete({ where: { id } });
  return { id, softDeleted: false };
}

/** Full product config for the admin editor. */
export async function getAdminProduct(id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      specGroups: {
        orderBy: { displayOrder: "asc" },
        include: { options: { orderBy: { displayOrder: "asc" } } },
      },
      quantityTiers: { orderBy: { quantity: "asc" } },
      deliverySpeeds: { orderBy: { displayOrder: "asc" } },
      priceMatrix: true,
    },
  });
  if (!p) throw new HttpError(404, "Product not found");
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.categoryId,
    category: p.category.name,
    pricingModel: p.pricingModel,
    unitType: p.unitType,
    requiresDimensions: p.requiresDimensions,
    unitRate: num(p.unitRate),
    minQuantity: p.minQuantity,
    pricesIncludeGst: p.pricesIncludeGst,
    singlePrintThreshold: p.singlePrintThreshold,
    singlePrintRate: num(p.singlePrintRate),
    badges: p.badges,
    printTypeLabel: p.printTypeLabel,
    standardSizeLabel: p.standardSizeLabel,
    bleedArea: p.bleedArea,
    fileFormats: p.fileFormats,
    basePriceFrom: num(p.basePriceFrom),
    isActive: p.isActive,
    specGroups: p.specGroups.map((g) => ({
      id: g.id,
      name: g.name,
      selectionType: g.selectionType,
      isPricingDimension: g.isPricingDimension,
      isRequired: g.isRequired,
      icon: g.icon,
      displayOrder: g.displayOrder,
      isActive: g.isActive,
      options: g.options.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        addOnType: o.addOnType,
        addOnValue: num(o.addOnValue) ?? 0,
        perQuantity: o.perQuantity,
        isDefault: o.isDefault,
        displayOrder: o.displayOrder,
        isActive: o.isActive,
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
    matrixRows: p.priceMatrix.length,
  };
}

// ─────────────────── Spec groups / options ───────────────────

export async function createSpecGroup(productId: string, input: SpecGroupInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Product not found");
  const g = await prisma.specGroup.create({
    data: {
      productId,
      name: input.name,
      selectionType: input.selectionType ?? "SINGLE_SELECT",
      isPricingDimension: input.isPricingDimension ?? false,
      isRequired: input.isRequired ?? true,
      icon: input.icon ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
  return { id: g.id };
}

export async function updateSpecGroup(id: string, input: SpecGroupInput) {
  await prisma.specGroup.update({
    where: { id },
    data: {
      name: input.name,
      selectionType: input.selectionType,
      isPricingDimension: input.isPricingDimension,
      isRequired: input.isRequired,
      icon: input.icon ?? undefined,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
  return { id };
}

export async function deleteSpecGroup(id: string) {
  await prisma.specGroup.delete({ where: { id } });
  return { id };
}

export async function createSpecOption(specGroupId: string, input: SpecOptionInput) {
  const g = await prisma.specGroup.findUnique({ where: { id: specGroupId } });
  if (!g) throw new HttpError(404, "Spec group not found");
  const o = await prisma.specOption.create({
    data: {
      specGroupId,
      name: input.name,
      description: input.description ?? null,
      addOnType: input.addOnType ?? "FLAT",
      addOnValue: input.addOnValue ?? 0,
      perQuantity: input.perQuantity ?? 1,
      isDefault: input.isDefault ?? false,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
  return { id: o.id };
}

export async function updateSpecOption(id: string, input: SpecOptionInput) {
  await prisma.specOption.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description ?? undefined,
      addOnType: input.addOnType,
      addOnValue: input.addOnValue,
      perQuantity: input.perQuantity,
      isDefault: input.isDefault,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
  return { id };
}

export async function deleteSpecOption(id: string) {
  await prisma.specOption.delete({ where: { id } });
  return { id };
}

// ───────────────────── Tiers / delivery ─────────────────────

export async function setQuantityTiers(productId: string, input: TiersInput) {
  await prisma.$transaction([
    prisma.quantityTier.deleteMany({ where: { productId } }),
    prisma.quantityTier.createMany({
      data: input.tiers.map((t, i) => ({
        productId,
        quantity: t.quantity,
        basePrice: t.basePrice,
        label: t.label ?? null,
        displayOrder: i,
      })),
    }),
  ]);
  return { count: input.tiers.length };
}

export async function setDeliverySpeeds(productId: string, input: DeliveryInput) {
  await prisma.$transaction([
    prisma.deliverySpeed.deleteMany({ where: { productId } }),
    prisma.deliverySpeed.createMany({
      data: input.speeds.map((s, i) => ({
        productId,
        name: s.name,
        fee: s.fee,
        etaMinDays: s.etaMinDays,
        etaMaxDays: s.etaMaxDays,
        displayOrder: i,
      })),
    }),
  ]);
  return { count: input.speeds.length };
}

// ─────────────────────── Price matrix ───────────────────────

/**
 * Matrix editor payload: the product's pricing-dimension groups (+ options) and
 * the current rate rows, each expanded to readable option labels.
 */
export async function getMatrix(productId: string) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      specGroups: {
        where: { isPricingDimension: true, isActive: true },
        orderBy: { displayOrder: "asc" },
        include: { options: { where: { isActive: true }, orderBy: { displayOrder: "asc" } } },
      },
      priceMatrix: true,
    },
  });
  if (!p) throw new HttpError(404, "Product not found");

  const optName = new Map<string, string>();
  for (const g of p.specGroups) for (const o of g.options) optName.set(o.id, o.name);

  return {
    productId: p.id,
    pricingModel: p.pricingModel,
    pricesIncludeGst: p.pricesIncludeGst,
    dimensions: p.specGroups.map((g) => ({
      id: g.id,
      name: g.name,
      options: g.options.map((o) => ({ id: o.id, name: o.name })),
    })),
    rows: p.priceMatrix.map((m) => ({
      id: m.id,
      optionIds: m.optionIds,
      labels: m.optionIds.map((id) => optName.get(id) ?? id),
      ratePerSheet: num(m.ratePerSheet) ?? 0,
      isActive: m.isActive,
    })),
  };
}

/** Replace the whole matrix. Validates each row picks one option per dimension. */
export async function setMatrix(productId: string, input: MatrixInput) {
  const groups = await prisma.specGroup.findMany({
    where: { productId, isPricingDimension: true, isActive: true },
    include: { options: { where: { isActive: true }, select: { id: true } } },
  });
  if (groups.length === 0) {
    throw new HttpError(422, "Mark at least one spec group as a pricing dimension first");
  }
  const optionToGroup = new Map<string, string>();
  for (const g of groups) for (const o of g.options) optionToGroup.set(o.id, g.id);

  const seen = new Set<string>();
  const data = input.rows.map((row) => {
    const groupsHit = new Set<string>();
    for (const oid of row.optionIds) {
      const gid = optionToGroup.get(oid);
      if (!gid) throw new HttpError(422, `Option ${oid} is not a pricing-dimension option`);
      if (groupsHit.has(gid)) {
        throw new HttpError(422, "A row cannot pick two options from the same dimension");
      }
      groupsHit.add(gid);
    }
    if (groupsHit.size !== groups.length) {
      throw new HttpError(422, "Each row must pick exactly one option per pricing dimension");
    }
    const comboKey = buildComboKey(row.optionIds);
    if (seen.has(comboKey)) throw new HttpError(422, "Duplicate combination in the matrix");
    seen.add(comboKey);
    return {
      productId,
      comboKey,
      optionIds: [...row.optionIds].sort(),
      ratePerSheet: row.ratePerSheet,
    };
  });

  await prisma.$transaction([
    prisma.priceMatrix.deleteMany({ where: { productId } }),
    prisma.priceMatrix.createMany({ data }),
  ]);
  return { count: data.length };
}

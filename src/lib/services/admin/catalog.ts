import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { buildComboKey } from "@/lib/services/pricing";
import { slugify } from "@/lib/dto/admin";
import type {
  CategoryInput,
  UpdateCategoryInput,
  CreateProductInput,
  UpdateProductInput,
  SpecGroupInput,
  SpecOptionInput,
  MatrixInput,
} from "@/lib/dto/admin";
import { productImageKey } from "@/lib/productImages";
import { deleteUpload } from "@/lib/storage";

const num = (d: unknown) => (d == null ? null : Number(d));

// ───────────────────────── Categories ─────────────────────────

export async function listCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });
  const nameById = new Map(cats.map((c) => [c.id, c.name]));
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    productCount: c._count.products,
    parentId: c.parentId,
    parentName: c.parentId ? (nameById.get(c.parentId) ?? null) : null,
    childCount: c._count.children,
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
      parentId: input.parentId ?? null,
    },
  });
  return { id: c.id };
}

/**
 * Reject a parent that would create a cycle (A → B → A) or self-parenting.
 * Walks up from the proposed parent; if we meet `id`, the link closes a loop.
 * Depth-bounded so pre-existing bad data can't spin forever.
 */
async function assertNoCategoryCycle(id: string, parentId: string | null | undefined) {
  if (!parentId) return;
  if (parentId === id) throw new HttpError(422, "A category cannot be its own parent");
  let cursor: string | null = parentId;
  for (let hops = 0; cursor && hops < 32; hops++) {
    if (cursor === id) {
      throw new HttpError(422, "That would make the category a descendant of itself");
    }
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    if (!parent) throw new HttpError(422, "Parent category not found");
    cursor = parent.parentId;
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await assertNoCategoryCycle(id, input.parentId);
  await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.slug ? { slug: slugify(input.slug) } : {}),
      icon: input.icon ?? undefined,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
      // undefined = leave alone; null = promote back to a top-level category
      parentId: input.parentId === undefined ? undefined : input.parentId,
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
      _count: { select: { specGroups: true, priceMatrix: true, orderItems: true, images: true } },
      images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true } },
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
    image: p.images[0]?.url ?? null,
    imageCount: p._count.images,
  }));
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "product";
  let i = 1;
  // ensure uniqueness
  for (;;) {
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
      maxQuantity: input.maxQuantity ?? null,
      quantityStep: input.quantityStep ?? 1,
      additionalDesignCharge: input.additionalDesignCharge ?? null,
      productCode: input.productCode ?? null,
      productClass: input.productClass ?? null,
      productionTime: input.productionTime ?? null,
      pricesIncludeGst: input.pricesIncludeGst ?? false,
      singlePrintThreshold: input.singlePrintThreshold ?? null,
      singlePrintRate: input.singlePrintRate ?? null,
      badges: input.badges ?? [],
      printTypeLabel: input.printTypeLabel ?? null,
      standardSizeLabel: input.standardSizeLabel ?? null,
      bleedArea: input.bleedArea ?? null,
      fileFormats: input.fileFormats ?? [],
      basePriceFrom: input.basePriceFrom ?? null,
      // New products start as DRAFTS. A fresh product has no spec groups,
      // options or prices yet, so defaulting to live put an unorderable product
      // straight into the customer catalogue. Publish it once it can be quoted.
      isActive: input.isActive ?? false,
    },
  });
  return { id: p.id, slug: p.slug };
}

/**
 * A product may only go live if a customer could actually get a price for it.
 *
 * "visiting card" reached the live storefront with two required spec groups
 * that had zero options between them, so every quote returned 422 — the
 * catalogue advertised something nobody could buy, and nothing stopped it.
 */
async function assertProductOrderable(productId: string) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      specGroups: {
        where: { isActive: true },
        include: { options: { where: { isActive: true }, select: { id: true } } },
      },
      priceMatrix: { where: { isActive: true }, select: { id: true } },
    },
  });
  if (!p) throw new HttpError(404, "Product not found");

  const problems: string[] = [];
  for (const g of p.specGroups) {
    if (g.isRequired && g.options.length === 0) {
      problems.push(`"${g.name}" is required but has no options`);
    }
  }
  if (p.pricingModel === "PER_UNIT" && p.unitRate == null) {
    problems.push("per-unit pricing needs a unit rate");
  }
  if (p.pricingModel === "MATRIX" && p.priceMatrix.length === 0) {
    problems.push("matrix pricing needs at least one price row");
  }

  if (problems.length > 0) {
    throw new HttpError(
      422,
      `"${p.name}" is not ready to go live — ${problems.join("; ")}. ` +
        `Customers would see it in the catalogue but every price request would fail.`,
    );
  }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Product not found");
  // Publishing is the gate, not editing: configure freely, but a product only
  // becomes visible to customers once it can actually be quoted.
  if (input.isActive === true) await assertProductOrderable(id);
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
      maxQuantity: input.maxQuantity ?? undefined,
      quantityStep: input.quantityStep,
      additionalDesignCharge: input.additionalDesignCharge ?? undefined,
      productCode: input.productCode ?? undefined,
      productClass: input.productClass ?? undefined,
      productionTime: input.productionTime ?? undefined,
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
  const images = await prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });
  await prisma.product.delete({ where: { id } });
  // The rows went with the product; clear the files we stored for them (best effort).
  for (const i of images) {
    const key = productImageKey(i.url);
    if (key) await deleteUpload(key).catch(() => {});
  }
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
    maxQuantity: p.maxQuantity,
    quantityStep: p.quantityStep,
    additionalDesignCharge: num(p.additionalDesignCharge),
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
    basePriceFrom: num(p.basePriceFrom),
    isActive: p.isActive,
    specGroups: p.specGroups.map((g) => ({
      id: g.id,
      name: g.name,
      selectionType: g.selectionType,
      isPricingDimension: g.isPricingDimension,
      isQuantityDimension: g.isQuantityDimension,
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
        quantityValue: o.quantityValue,
        code: o.code,
      })),
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

/**
 * A product may have at most ONE quantity dimension — the schema says so but
 * cannot express it, and resolveAndPrice would silently take whichever group
 * it happened to read last. `excludeId` skips the row being updated.
 */
async function assertSingleQuantityDimension(productId: string, excludeId?: string) {
  const existing = await prisma.specGroup.findFirst({
    where: {
      productId,
      isQuantityDimension: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { name: true },
  });
  if (existing) {
    throw new HttpError(
      422,
      `"${existing.name}" is already this product's quantity dimension — a product can only have one.`,
    );
  }
}

export async function createSpecGroup(productId: string, input: SpecGroupInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Product not found");

  // A quantity dimension is by definition part of the price combination.
  const isQuantityDimension = input.isQuantityDimension ?? false;
  if (isQuantityDimension) await assertSingleQuantityDimension(productId);

  const g = await prisma.specGroup.create({
    data: {
      productId,
      name: input.name,
      selectionType: input.selectionType ?? "SINGLE_SELECT",
      isPricingDimension: (input.isPricingDimension ?? false) || isQuantityDimension,
      isQuantityDimension,
      isRequired: input.isRequired ?? true,
      icon: input.icon ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
  return { id: g.id };
}

export async function updateSpecGroup(id: string, input: SpecGroupInput) {
  if (input.isQuantityDimension) {
    const g = await prisma.specGroup.findUnique({
      where: { id },
      select: { productId: true },
    });
    if (!g) throw new HttpError(404, "Spec group not found");
    await assertSingleQuantityDimension(g.productId, id);
  }
  await prisma.specGroup.update({
    where: { id },
    data: {
      name: input.name,
      selectionType: input.selectionType,
      isPricingDimension: input.isPricingDimension,
      isQuantityDimension: input.isQuantityDimension,
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
  // An option in the quantity group IS a quantity; without a value it would be
  // saved happily and then fail at quote time with an unhelpful error.
  if (g.isQuantityDimension && !input.quantityValue) {
    throw new HttpError(
      422,
      `"${g.name}" is the quantity dimension — every option needs the number of units it represents.`,
    );
  }
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
      quantityValue: input.quantityValue ?? null,
      code: input.code ?? null,
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
      quantityValue: input.quantityValue === undefined ? undefined : input.quantityValue,
      code: input.code ?? undefined,
    },
  });
  return { id };
}

export async function deleteSpecOption(id: string) {
  await prisma.specOption.delete({ where: { id } });
  return { id };
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
      isQuantityDimension: g.isQuantityDimension,
      options: g.options.map((o) => ({ id: o.id, name: o.name })),
    })),
    rows: p.priceMatrix.map((m) => ({
      id: m.id,
      optionIds: m.optionIds,
      labels: m.optionIds.map((id) => optName.get(id) ?? id),
      ratePerSheet: num(m.ratePerSheet),
      flatPrice: num(m.flatPrice),
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
      ratePerSheet: row.ratePerSheet ?? null,
      flatPrice: row.flatPrice ?? null,
    };
  });

  await prisma.$transaction([
    prisma.priceMatrix.deleteMany({ where: { productId } }),
    prisma.priceMatrix.createMany({ data }),
  ]);
  return { count: data.length };
}

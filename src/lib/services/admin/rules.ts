import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import type { VisibilityRuleInput } from "@/lib/dto/admin";

/**
 * Visibility-rule CRUD. A rule shows its target (a spec group, or one option)
 * only when its conditions hold — see src/lib/visibility.ts for the semantics
 * both the configurator and the pricing path evaluate with.
 *
 * Everything a rule references must belong to the SAME product, otherwise a
 * rule could silently never fire (or worse, gate on another product's options).
 */

interface Shape {
  groupIds: Set<string>;
  optionToGroup: Map<string, string>;
  groupName: Map<string, string>;
  optionName: Map<string, string>;
}

async function loadShape(productId: string): Promise<Shape> {
  const groups = await prisma.specGroup.findMany({
    where: { productId },
    include: { options: { select: { id: true, name: true } } },
  });
  const shape: Shape = {
    groupIds: new Set(),
    optionToGroup: new Map(),
    groupName: new Map(),
    optionName: new Map(),
  };
  for (const g of groups) {
    shape.groupIds.add(g.id);
    shape.groupName.set(g.id, g.name);
    for (const o of g.options) {
      shape.optionToGroup.set(o.id, g.id);
      shape.optionName.set(o.id, o.name);
    }
  }
  return shape;
}

function validate(input: VisibilityRuleInput, shape: Shape) {
  const targetGroupId =
    input.targetType === "GROUP"
      ? input.targetGroupId!
      : shape.optionToGroup.get(input.targetOptionId!);

  if (input.targetType === "GROUP" && !shape.groupIds.has(input.targetGroupId!)) {
    throw new HttpError(422, "The targeted spec group is not part of this product");
  }
  if (input.targetType === "OPTION" && !shape.optionToGroup.has(input.targetOptionId!)) {
    throw new HttpError(422, "The targeted option is not part of this product");
  }

  for (const c of input.conditions) {
    if (!shape.groupIds.has(c.sourceGroupId)) {
      throw new HttpError(422, "A condition references a group from another product");
    }
    // Gating a group on itself can never resolve — the group would have to be
    // visible to be selected, and selected to be visible.
    if (c.sourceGroupId === targetGroupId) {
      throw new HttpError(
        422,
        `"${shape.groupName.get(c.sourceGroupId) ?? "This group"}" cannot be conditional on itself`,
      );
    }
    for (const oid of c.optionIds) {
      if (shape.optionToGroup.get(oid) !== c.sourceGroupId) {
        throw new HttpError(
          422,
          "A condition lists an option that does not belong to its source group",
        );
      }
    }
  }
}

function serialize(
  r: {
    id: string;
    targetType: string;
    targetGroupId: string | null;
    targetOptionId: string | null;
    logic: string;
    conditions: { id: string; sourceGroupId: string; operator: string; optionIds: string[] }[];
  },
  shape: Shape,
) {
  return {
    id: r.id,
    targetType: r.targetType,
    targetGroupId: r.targetGroupId,
    targetOptionId: r.targetOptionId,
    targetLabel:
      r.targetType === "GROUP"
        ? (shape.groupName.get(r.targetGroupId ?? "") ?? "—")
        : (shape.optionName.get(r.targetOptionId ?? "") ?? "—"),
    logic: r.logic,
    conditions: r.conditions.map((c) => ({
      id: c.id,
      sourceGroupId: c.sourceGroupId,
      sourceGroupName: shape.groupName.get(c.sourceGroupId) ?? "—",
      operator: c.operator,
      optionIds: c.optionIds,
      optionNames: c.optionIds.map((id) => shape.optionName.get(id) ?? id),
    })),
  };
}

export async function listRules(productId: string) {
  const [shape, rules] = await Promise.all([
    loadShape(productId),
    prisma.visibilityRule.findMany({
      where: { productId },
      include: { conditions: true },
      orderBy: { id: "asc" },
    }),
  ]);
  return rules.map((r) => serialize(r, shape));
}

export async function createRule(productId: string, input: VisibilityRuleInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Product not found");

  const shape = await loadShape(productId);
  validate(input, shape);

  const rule = await prisma.visibilityRule.create({
    data: {
      productId,
      targetType: input.targetType,
      targetGroupId: input.targetType === "GROUP" ? input.targetGroupId! : null,
      targetOptionId: input.targetType === "OPTION" ? input.targetOptionId! : null,
      logic: input.logic ?? "AND",
      conditions: {
        create: input.conditions.map((c) => ({
          sourceGroupId: c.sourceGroupId,
          operator: c.operator ?? "IS",
          optionIds: c.optionIds,
        })),
      },
    },
    include: { conditions: true },
  });
  return serialize(rule, shape);
}

export async function updateRule(id: string, input: VisibilityRuleInput) {
  const existing = await prisma.visibilityRule.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Rule not found");

  const shape = await loadShape(existing.productId);
  validate(input, shape);

  // Conditions are replace-all: simpler than diffing, and a rule is small.
  const rule = await prisma.$transaction(async (tx) => {
    await tx.ruleCondition.deleteMany({ where: { ruleId: id } });
    return tx.visibilityRule.update({
      where: { id },
      data: {
        targetType: input.targetType,
        targetGroupId: input.targetType === "GROUP" ? input.targetGroupId! : null,
        targetOptionId: input.targetType === "OPTION" ? input.targetOptionId! : null,
        logic: input.logic ?? "AND",
        conditions: {
          create: input.conditions.map((c) => ({
            sourceGroupId: c.sourceGroupId,
            operator: c.operator ?? "IS",
            optionIds: c.optionIds,
          })),
        },
      },
      include: { conditions: true },
    });
  });
  return serialize(rule, shape);
}

export async function deleteRule(id: string) {
  const existing = await prisma.visibilityRule.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Rule not found");
  await prisma.visibilityRule.delete({ where: { id } }); // conditions cascade
  return { id };
}

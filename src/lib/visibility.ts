// ─────────────────────────────────────────────────────────────
// Conditional spec visibility (pure — no DB, no React).
//
// A VisibilityRule makes its target (a whole SpecGroup, or a single SpecOption)
// conditional on what is selected in OTHER groups. Example: show "Foil Color"
// only when Finish IS Foil.
//
// Semantics, deliberately conservative:
//   • A target with NO rules is always visible.
//   • A target WITH rules is visible when ANY of its rules is satisfied
//     (rules OR together; conditions inside one rule combine per rule.logic).
//   • Hiding cascades: a hidden group's selection stops counting, which may
//     hide further targets. Resolved by iterating to a fixpoint.
//
// Both the configurator (to filter the UI) and resolveAndPrice (to reject a
// hidden option submitted directly to the API) evaluate with this module, so
// the two can never disagree.
// ─────────────────────────────────────────────────────────────

export type RuleTarget = "GROUP" | "OPTION";
export type RuleOperator = "IS" | "IS_NOT" | "IN";
export type RuleLogic = "AND" | "OR";

export interface RuleConditionLite {
  sourceGroupId: string;
  operator: RuleOperator;
  optionIds: string[];
}

export interface VisibilityRuleLite {
  targetType: RuleTarget;
  targetGroupId?: string | null;
  targetOptionId?: string | null;
  logic: RuleLogic;
  conditions: RuleConditionLite[];
}

export type Selections = Record<string, string | string[] | undefined>;

export interface VisibilityResult {
  hiddenGroupIds: Set<string>;
  hiddenOptionIds: Set<string>;
}

const asArray = (v: string | string[] | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const intersects = (a: string[], b: string[]) => a.some((x) => b.includes(x));

/**
 * IS and IN both mean "the source group's selection matches one of these
 * options" — IS reads naturally for a single value, IN for a list. IS_NOT is
 * the negation. A group with nothing selected satisfies only IS_NOT.
 */
function conditionHolds(
  c: RuleConditionLite,
  selections: Selections,
  hiddenGroupIds: Set<string>,
): boolean {
  // A hidden source can't justify showing anything — treat it as unselected.
  const selected = hiddenGroupIds.has(c.sourceGroupId)
    ? []
    : asArray(selections[c.sourceGroupId]);

  switch (c.operator) {
    case "IS_NOT":
      return !intersects(selected, c.optionIds);
    case "IS":
    case "IN":
    default:
      return intersects(selected, c.optionIds);
  }
}

function ruleHolds(
  rule: VisibilityRuleLite,
  selections: Selections,
  hiddenGroupIds: Set<string>,
): boolean {
  if (rule.conditions.length === 0) return true; // no conditions ⇒ nothing to gate on
  const results = rule.conditions.map((c) => conditionHolds(c, selections, hiddenGroupIds));
  return rule.logic === "OR" ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Resolve which groups and options are hidden for the given selections.
 * Iterates until stable so that hiding a group can cascade to its dependants.
 */
export function evaluateVisibility(
  rules: VisibilityRuleLite[],
  selections: Selections,
): VisibilityResult {
  const hiddenGroupIds = new Set<string>();
  const hiddenOptionIds = new Set<string>();
  if (rules.length === 0) return { hiddenGroupIds, hiddenOptionIds };

  // Bucket rules by the thing they target.
  const byGroup = new Map<string, VisibilityRuleLite[]>();
  const byOption = new Map<string, VisibilityRuleLite[]>();
  for (const r of rules) {
    const key = r.targetType === "GROUP" ? r.targetGroupId : r.targetOptionId;
    if (!key) continue;
    const map = r.targetType === "GROUP" ? byGroup : byOption;
    const list = map.get(key);
    if (list) list.push(r);
    else map.set(key, [r]);
  }

  // Fixpoint: bounded by the number of rules, since each pass can only hide more.
  for (let pass = 0; pass <= rules.length; pass++) {
    let changed = false;

    for (const [groupId, groupRules] of byGroup) {
      if (hiddenGroupIds.has(groupId)) continue;
      if (!groupRules.some((r) => ruleHolds(r, selections, hiddenGroupIds))) {
        hiddenGroupIds.add(groupId);
        changed = true;
      }
    }
    for (const [optionId, optionRules] of byOption) {
      if (hiddenOptionIds.has(optionId)) continue;
      if (!optionRules.some((r) => ruleHolds(r, selections, hiddenGroupIds))) {
        hiddenOptionIds.add(optionId);
        changed = true;
      }
    }

    if (!changed) break;
  }

  return { hiddenGroupIds, hiddenOptionIds };
}

/** Drop selections that point at hidden groups or hidden options. */
export function pruneSelections(
  selections: Selections,
  { hiddenGroupIds, hiddenOptionIds }: VisibilityResult,
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [groupId, value] of Object.entries(selections)) {
    if (value == null || hiddenGroupIds.has(groupId)) continue;
    if (Array.isArray(value)) {
      const kept = value.filter((id) => !hiddenOptionIds.has(id));
      if (kept.length) out[groupId] = kept;
    } else if (!hiddenOptionIds.has(value)) {
      out[groupId] = value;
    }
  }
  return out;
}

"use client";

// Conditional visibility editor.
//
// A rule shows its target — a whole spec group, or one option — only when its
// conditions hold, e.g. "show Foil Colour when Finish is Foil". Anything with
// no rule is always visible. The pricing endpoint evaluates the SAME rules via
// src/lib/visibility.ts, so an option hidden here cannot be ordered even by
// calling the API directly.

import { useCallback, useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useToast, useConfirm } from "@/components/ui/UIProvider";

interface Option {
  id: string;
  name: string;
}
interface SpecGroup {
  id: string;
  name: string;
  options: Option[];
}
interface ProductLite {
  id: string;
  specGroups: SpecGroup[];
}

interface RuleCondition {
  id?: string;
  sourceGroupId: string;
  sourceGroupName?: string;
  operator: string;
  optionIds: string[];
  optionNames?: string[];
}
interface Rule {
  id: string;
  targetType: string;
  targetGroupId: string | null;
  targetOptionId: string | null;
  targetLabel: string;
  logic: string;
  conditions: RuleCondition[];
}

export default function RulesEditor({ product }: { product: ProductLite }) {
  const toast = useToast();
  const confirm = useConfirm();

  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [targetType, setTargetType] = useState("OPTION");
  const [targetId, setTargetId] = useState("");
  const [sourceGroupId, setSourceGroupId] = useState("");
  const [operator, setOperator] = useState("IS");
  const [optionIds, setOptionIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const { rules } = await admin.rules.list(product.id);
      setRules(rules as Rule[]);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // A group can't be gated on itself — it would have to be visible to be
  // selected, and selected to be visible. Exclude it from the source list.
  const targetGroupId =
    targetType === "GROUP"
      ? targetId
      : (product.specGroups.find((g) => g.options.some((o) => o.id === targetId))?.id ?? "");
  const sourceGroups = product.specGroups.filter((g) => g.id !== targetGroupId);
  const sourceOptions = product.specGroups.find((g) => g.id === sourceGroupId)?.options ?? [];

  const reset = () => {
    setTargetType("OPTION");
    setTargetId("");
    setSourceGroupId("");
    setOperator("IS");
    setOptionIds([]);
    setShowForm(false);
    setErr(null);
  };

  const create = async () => {
    if (!targetId) return setErr("Choose what this rule shows");
    if (!sourceGroupId) return setErr("Choose the group the rule depends on");
    if (optionIds.length === 0) return setErr("Pick at least one option to match");
    setBusy(true);
    setErr(null);
    try {
      await admin.rules.create(product.id, {
        targetType,
        targetGroupId: targetType === "GROUP" ? targetId : null,
        targetOptionId: targetType === "OPTION" ? targetId : null,
        logic: "AND",
        conditions: [{ sourceGroupId, operator, optionIds }],
      });
      toast("Rule added", "success");
      reset();
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to add rule");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r: Rule) => {
    const ok = await confirm({
      title: "Delete this rule?",
      message: `"${r.targetLabel}" will always be shown again.`,
      confirmLabel: "Delete rule",
      danger: true,
    });
    if (!ok) return;
    try {
      await admin.rules.remove(r.id);
      toast("Rule deleted", "success");
      await load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to delete rule", "error");
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
      <div className="p-6 border-b border-outline-variant/40 flex items-start gap-2">
        <span className="material-symbols-outlined text-secondary" aria-hidden="true">rule</span>
        <div>
          <h2 className="font-headline-md text-[20px]">Conditional Visibility</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Show an option, or a whole group, only for certain selections. Anything
            without a rule is always visible.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading rules…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No rules yet — every option is always visible.
          </p>
        ) : (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-2 p-3 bg-surface-container-low rounded-lg text-sm"
              >
                <span className="font-bold text-primary-container">Show {r.targetLabel}</span>
                <span className="text-on-surface-variant">when</span>
                {r.conditions.map((c, i) => (
                  <span key={c.id ?? i} className="text-on-surface-variant">
                    {i > 0 && <span className="mx-1 font-bold">{r.logic}</span>}
                    <b>{c.sourceGroupName}</b> {c.operator === "IS_NOT" ? "is not" : "is"}{" "}
                    <b>{(c.optionNames ?? c.optionIds).join(" / ")}</b>
                  </span>
                ))}
                <button
                  onClick={() => remove(r)}
                  aria-label={`Delete rule for ${r.targetLabel}`}
                  className="ml-auto text-error hover:bg-error/10 rounded p-1"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {showForm ? (
          <div className="p-4 bg-surface-container-low rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="rule-target" className="text-[10px] font-bold uppercase text-on-surface-variant">
                  Show what
                </label>
                <select
                  id="rule-target"
                  value={`${targetType}:${targetId}`}
                  onChange={(e) => {
                    const [t, id] = e.target.value.split(":");
                    setTargetType(t);
                    setTargetId(id ?? "");
                    setSourceGroupId("");
                    setOptionIds([]);
                  }}
                  className="border border-surface-container bg-white rounded-lg p-2 text-sm"
                >
                  <option value="OPTION:">Choose…</option>
                  {product.specGroups.map((g) => (
                    <optgroup key={g.id} label={g.name}>
                      <option value={`GROUP:${g.id}`}>Whole group — {g.name}</option>
                      {g.options.map((o) => (
                        <option key={o.id} value={`OPTION:${o.id}`}>
                          {g.name} → {o.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="rule-source" className="text-[10px] font-bold uppercase text-on-surface-variant">
                  Depends on group
                </label>
                <select
                  id="rule-source"
                  value={sourceGroupId}
                  onChange={(e) => {
                    setSourceGroupId(e.target.value);
                    setOptionIds([]);
                  }}
                  className="border border-surface-container bg-white rounded-lg p-2 text-sm"
                >
                  <option value="">Choose…</option>
                  {sourceGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {sourceGroupId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Condition operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="border border-surface-container bg-white rounded-lg p-2 text-sm"
                  >
                    <option value="IS">is</option>
                    <option value="IS_NOT">is not</option>
                  </select>
                  <span className="text-xs text-on-surface-variant">one of the options ticked below</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sourceOptions.map((o) => (
                    <label
                      key={o.id}
                      className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white border border-outline-variant rounded-full cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-secondary"
                        checked={optionIds.includes(o.id)}
                        onChange={(e) =>
                          setOptionIds((prev) =>
                            e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id),
                          )
                        }
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {err && <p className="text-error text-xs">{err}</p>}
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={busy}
                className="px-4 py-2 primary-accent-gradient text-white rounded-lg font-button text-sm disabled:opacity-50"
              >
                {busy ? "Adding…" : "Add Rule"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-button text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 border border-dashed border-outline-variant text-on-surface-variant rounded-lg font-button text-sm hover:border-secondary hover:text-secondary transition-colors"
          >
            + Add Rule
          </button>
        )}
      </div>
    </section>
  );
}

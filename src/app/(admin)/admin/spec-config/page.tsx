"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { admin, ApiError } from "@/lib/api";
import RulesEditor from "@/components/admin/RulesEditor";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";

// ───────────────────────── Types ─────────────────────────
type SpecOption = {
  id: string;
  name: string;
  description: string | null;
  addOnType: string;
  addOnValue: number;
  perQuantity: boolean | number;
  isDefault: boolean;
};
type SpecGroup = {
  id: string;
  name: string;
  selectionType: string;
  isPricingDimension: boolean;
  isQuantityDimension?: boolean;
  isRequired: boolean;
  options: SpecOption[];
};
type Product = {
  id: string;
  name: string;
  category: string;
  pricingModel: string;
  pricesIncludeGst: boolean;
  specGroups: SpecGroup[];
};
type MatrixDimension = {
  id: string;
  name: string;
  isQuantityDimension?: boolean;
  options: { id: string; name: string }[];
};
type MatrixRow = {
  id: string;
  optionIds: string[];
  labels: string[];
  ratePerSheet: number | null;
  flatPrice: number | null;
  isActive: boolean;
};
type Matrix = {
  productId: string;
  pricingModel: string;
  pricesIncludeGst: boolean;
  dimensions: MatrixDimension[];
  rows: MatrixRow[];
};
type ProductListItem = { id: string; name: string; category: string; pricingModel: string; specGroups: number; matrixRows: number };

// Build the cartesian product of dimension option lists.
// Each element is an array of one option id per dimension, in dimension order.
function cartesian(dims: MatrixDimension[]): string[][] {
  if (dims.length === 0) return [];
  return dims.reduce<string[][]>(
    (acc, dim) => acc.flatMap((combo) => dim.options.map((o) => [...combo, o.id])),
    [[]],
  );
}

// Key that is order-independent so a combo matches an existing row regardless
// of the order option ids are stored in.
const comboKey = (ids: string[]) => [...ids].sort().join("|");

export default function SpecConfigPage() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant">Loading…</div>}>
      <SpecConfiguration />
    </Suspense>
  );
}

function SpecConfiguration() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  if (!productId) return <ProductPicker />;
  return <ProductEditor productId={productId} />;
}

// ───────────────────────── Product picker ─────────────────────────
function ProductPicker() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { products } = await admin.products.list();
      setProducts(products as ProductListItem[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Spec & Price Configuration</h1>
        <p className="font-body-md text-on-surface-variant">Select a product to edit its specifications and pricing.</p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-on-surface-variant">Loading products…</div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-error/10 text-error text-sm font-medium flex flex-wrap items-center gap-3" role="alert">
          <span>{error}</span>
          <button onClick={load} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-error/40 font-button text-sm hover:bg-error/10 transition-colors">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center text-on-surface-variant">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/admin/spec-config?product=${p.id}`}
              className="block bg-surface-container-lowest rounded-xl premium-shadow border border-outline-variant/30 p-5 hover:border-secondary-container transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-on-surface">{p.name}</h3>
                <span className="material-symbols-outlined text-secondary">chevron_right</span>
              </div>
              <p className="text-xs text-on-surface-variant">{p.category}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded-full uppercase">{p.pricingModel}</span>
                <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-full">{p.specGroups} specs</span>
                <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-full">{p.matrixRows} rates</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Product editor ─────────────────────────
function ProductEditor({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setError(null);
    try {
      const { product } = await admin.products.get(productId);
      setProduct(product as Product);
      if ((product as Product).pricingModel === "MATRIX") {
        const { matrix } = await admin.products.getMatrix(productId);
        setMatrix(matrix as Matrix);
      } else {
        setMatrix(null);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load product");
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    loadProduct().finally(() => setLoading(false));
  }, [loadProduct]);

  if (loading) return <div className="p-16 text-center text-on-surface-variant">Loading product…</div>;
  if (error) return (
    <div className="p-4 rounded-lg bg-error/10 text-error text-sm font-medium flex flex-wrap items-center gap-3" role="alert">
      <span>{error}</span>
      <button
        onClick={() => { setLoading(true); loadProduct().finally(() => setLoading(false)); }}
        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-error/40 font-button text-sm hover:bg-error/10 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
      </button>
    </div>
  );
  if (!product) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/spec-config" className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Products
          </Link>
          <span className="text-on-surface-variant font-medium">Editing:</span>
          <span className="px-4 py-2 bg-white border border-outline-variant rounded-lg font-semibold text-primary">{product.name}</span>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded-full uppercase">{product.pricingModel}</span>
          <span className="text-xs text-on-surface-variant">{product.category}</span>
        </div>
      </div>

      {/* Spec groups */}
      <SpecGroupsSection product={product} onChange={loadProduct} />

      <RulesEditor product={product} />

      {/* Price matrix */}
      {product.pricingModel === "MATRIX" && (
        <MatrixEditor productId={productId} matrix={matrix} onReload={loadProduct} />
      )}
    </div>
  );
}

// ───────────────────────── Spec groups ─────────────────────────
function SpecGroupsSection({ product, onChange }: { product: Product; onChange: () => Promise<void> }) {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [gName, setGName] = useState("");
  const [gPricingDim, setGPricingDim] = useState(false);
  const [gQtyDim, setGQtyDim] = useState(false);
  const [gRequired, setGRequired] = useState(true);
  const [gSelection, setGSelection] = useState("SINGLE_SELECT");
  const [gBusy, setGBusy] = useState(false);
  const [gError, setGError] = useState<string | null>(null);

  const addGroup = async () => {
    if (!gName.trim()) { setGError("Enter a group name"); return; }
    setGBusy(true);
    setGError(null);
    try {
      await admin.products.addSpecGroup(product.id, {
        name: gName.trim(),
        // A quantity dimension is always a pricing dimension: the run size is
        // part of the combination that resolves a price.
        isPricingDimension: gPricingDim || gQtyDim,
        isQuantityDimension: gQtyDim,
        isRequired: gRequired,
        selectionType: gSelection,
        displayOrder: product.specGroups.length,
      });
      setGName("");
      setGPricingDim(false);
      setGQtyDim(false);
      setGRequired(true);
      setGSelection("SINGLE_SELECT");
      setShowGroupForm(false);
      await onChange();
    } catch (e) {
      setGError(e instanceof ApiError ? e.message : "Failed to add spec group");
    } finally {
      setGBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">layers</span>
        <h2 className="font-headline-md text-[20px]">Specification Groups</h2>
      </div>

      {product.specGroups.length === 0 && (
        <p className="text-sm text-on-surface-variant">No spec groups yet. Add one below.</p>
      )}

      {product.specGroups.map((g) => (
        <SpecGroupCard key={g.id} group={g} onChange={onChange} />
      ))}

      {showGroupForm ? (
        <div className="bg-surface-container-lowest rounded-xl premium-shadow border border-outline-variant/30 p-6 space-y-4">
          <h3 className="font-bold text-on-surface">New Spec Group</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-on-surface-variant">Name</label>
              <input value={gName} onChange={(e) => setGName(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2" type="text" placeholder="e.g. Paper Quality" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-on-surface-variant">Selection Type</label>
              <select value={gSelection} onChange={(e) => setGSelection(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2">
                <option value="SINGLE_SELECT">Single Select</option>
                <option value="MULTI_SELECT">Multi Select</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={gPricingDim || gQtyDim} disabled={gQtyDim} onChange={(e) => setGPricingDim(e.target.checked)} className="rounded text-secondary" /> Pricing Dimension</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" title="This group IS the order quantity: each option carries the number of units, and prices are totals for the whole run."><input type="checkbox" checked={gQtyDim} onChange={(e) => setGQtyDim(e.target.checked)} className="rounded text-secondary" /> Quantity Dimension</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={gRequired} onChange={(e) => setGRequired(e.target.checked)} className="rounded text-secondary" /> Required</label>
          </div>
          {gError && <p className="text-error text-xs">{gError}</p>}
          <div className="flex gap-2">
            <button onClick={addGroup} disabled={gBusy} className="px-4 py-2 primary-accent-gradient text-white rounded-lg font-button text-sm disabled:opacity-50">{gBusy ? "Adding…" : "Add Group"}</button>
            <button onClick={() => setShowGroupForm(false)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-button text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowGroupForm(true)} className="w-full py-4 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-on-surface-variant font-bold hover:bg-surface-container-low hover:border-secondary-container transition-all">
          <span className="material-symbols-outlined">add_box</span> Add Spec Group
        </button>
      )}
    </div>
  );
}

function SpecGroupCard({ group, onChange }: { group: SpecGroup; onChange: () => Promise<void> }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [addOnType, setAddOnType] = useState("FLAT");
  const [addOnValue, setAddOnValue] = useState("");
  const [perQuantity, setPerQuantity] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [groupBusy, setGroupBusy] = useState(false);
  const [optionBusyId, setOptionBusyId] = useState<string | null>(null);

  const removeGroup = async () => {
    const ok = await confirm({
      title: `Delete spec group "${group.name}"?`,
      message: "This removes the group and all of its options. This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setGroupBusy(true);
    try {
      await admin.specGroups.remove(group.id);
      toast("Spec group deleted", "success");
      await onChange();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to delete spec group", "error");
      setGroupBusy(false);
    }
  };

  const removeOption = async (opt: SpecOption) => {
    const ok = await confirm({
      title: `Delete option "${opt.name}"?`,
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setOptionBusyId(opt.id);
    try {
      await admin.specOptions.remove(opt.id);
      toast("Option deleted", "success");
      await onChange();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to delete option", "error");
    } finally {
      setOptionBusyId(null);
    }
  };

  const [qtyValue, setQtyValue] = useState("");
  const [code, setCode] = useState("");

  const addOption = async () => {
    if (!name.trim()) { setErr("Enter an option name"); return; }
    if (group.isQuantityDimension && !(Number(qtyValue) > 0)) {
      setErr("Enter how many units this quantity option represents");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await admin.specGroups.addOption(group.id, {
        name: name.trim(),
        addOnType,
        addOnValue: Number(addOnValue) || 0,
        perQuantity,
        isDefault,
        quantityValue: group.isQuantityDimension ? Number(qtyValue) : null,
        code: code.trim() || null,
      });
      setName("");
      setQtyValue("");
      setCode("");
      setAddOnValue("");
      setAddOnType("FLAT");
      setPerQuantity(false);
      setIsDefault(false);
      setShowForm(false);
      await onChange();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to add option");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl premium-shadow border border-outline-variant/30">
      <div className="p-4 flex flex-wrap items-center gap-3 bg-surface-container-low rounded-t-xl">
        <span className="font-bold text-on-surface">{group.name}</span>
        {group.isPricingDimension && <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded-full uppercase">Pricing Dimension</span>}
        {group.isQuantityDimension && <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-full uppercase">Quantity</span>}
        {group.isRequired && <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full uppercase">Required</span>}
        <span className="text-[11px] text-on-surface-variant uppercase font-bold ml-auto">{group.selectionType}</span>
        <button
          onClick={removeGroup}
          disabled={groupBusy}
          aria-label={`Delete spec group ${group.name}`}
          title="Delete spec group"
          className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{groupBusy ? "hourglass_empty" : "delete"}</span>
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-label-caps text-on-surface-variant/70 border-b border-outline-variant">
              <th scope="col" className="pb-2 font-bold">Option Name</th>
              <th scope="col" className="pb-2 font-bold">Add-on Type</th>
              <th scope="col" className="pb-2 font-bold">Value (₹)</th>
              <th scope="col" className="pb-2 font-bold">Per Qty</th>
              <th scope="col" className="pb-2 font-bold">Default</th>
              <th scope="col" className="pb-2 font-bold text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {group.options.length === 0 ? (
              <tr><td colSpan={6} className="py-4 text-sm text-on-surface-variant">No options yet.</td></tr>
            ) : (
              group.options.map((o) => (
                <tr key={o.id}>
                  <td className="py-3"><div className="font-bold text-on-surface">{o.name}</div>{o.description && <div className="text-[11px] text-on-surface-variant">{o.description}</div>}</td>
                  <td className="py-3 text-sm">{o.addOnType}</td>
                  <td className="py-3 text-sm">{o.addOnType === "FREE" || o.addOnType === "INCLUDED" ? "—" : inr(o.addOnValue)}</td>
                  <td className="py-3 text-sm">{o.perQuantity ? "Yes" : "No"}</td>
                  <td className="py-3 text-sm">{o.isDefault ? <span className="text-secondary font-bold">Default</span> : ""}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => removeOption(o)}
                      disabled={optionBusyId === o.id}
                      aria-label={`Delete option ${o.name}`}
                      title="Delete option"
                      className="p-1.5 hover:bg-error-container/20 rounded-lg text-error transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{optionBusyId === o.id ? "hourglass_empty" : "delete"}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {showForm ? (
          <div className="mt-4 p-4 bg-surface-container-low rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2 text-sm" type="text" placeholder="Option name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Add-on Type</label>
                <select value={addOnType} onChange={(e) => setAddOnType(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2 text-sm">
                  <option value="FLAT">Flat (once)</option>
                  <option value="PER_UNIT">Per unit</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Value (₹)</label>
                <input value={addOnValue} onChange={(e) => setAddOnValue(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2 text-sm" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.isQuantityDimension && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant">Units in this quantity *</label>
                  <input value={qtyValue} onChange={(e) => setQtyValue(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2 text-sm" type="number" placeholder="e.g. 1000" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Catalogue code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} className="border border-surface-container bg-white rounded-lg p-2 text-sm" type="text" placeholder="e.g. 601" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={perQuantity} onChange={(e) => setPerQuantity(e.target.checked)} className="rounded text-secondary" /> Per Quantity</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-secondary" /> Default</label>
            </div>
            {err && <p className="text-error text-xs">{err}</p>}
            <div className="flex gap-2">
              <button onClick={addOption} disabled={busy} className="px-4 py-2 primary-accent-gradient text-white rounded-lg font-button text-sm disabled:opacity-50">{busy ? "Adding…" : "Add Option"}</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-button text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="mt-4 text-[13px] font-bold text-secondary-container flex items-center gap-1 hover:gap-2 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Option
          </button>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Matrix editor ─────────────────────────
function MatrixEditor({ productId, matrix, onReload }: { productId: string; matrix: Matrix | null; onReload: () => Promise<void> }) {
  const confirm = useConfirm();
  const toast = useToast();
  // rates keyed by order-independent combo key → string input value
  const [rates, setRates] = useState<Record<string, string>>({});
  // baseline = the last saved rates, used for dirty-checking + highlighting saved rows.
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Prefill from existing matrix rows whenever the matrix reloads.
  useEffect(() => {
    if (!matrix) return;
    const next: Record<string, string> = {};
    for (const row of matrix.rows) {
      // A row prices either per sheet or as a flat run total — show whichever it uses.
      next[comboKey(row.optionIds)] = String(row.flatPrice ?? row.ratePerSheet ?? "");
    }
    setRates(next);
    setBaseline(next);
  }, [matrix]);

  const combos = useMemo(() => (matrix ? cartesian(matrix.dimensions) : []), [matrix]);
  const dims = matrix?.dimensions ?? [];
  // When quantity is one of the dimensions, the combination already names the
  // run size, so the number entered is the TOTAL for that run — not a per-sheet
  // rate that would be multiplied again.
  const isFlat = dims.some((d) => d.isQuantityDimension);
  const priceLabel = isFlat ? "Total price" : "Rate per sheet";
  const optName = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of dims) for (const o of d.options) m.set(o.id, o.name);
    return m;
  }, [dims]);

  const noDimensions = dims.length === 0 || dims.some((d) => d.options.length === 0);

  // A cell is "set" when its value parses to a positive number.
  const norm = (v: string | undefined) => {
    const n = Number(v);
    return v != null && v !== "" && Number.isFinite(n) && n > 0 ? String(n) : "";
  };
  const dirty = useMemo(() => {
    const keys = new Set([...Object.keys(rates), ...Object.keys(baseline)]);
    for (const k of keys) {
      if (norm(rates[k]) !== norm(baseline[k])) return true;
    }
    return false;
  }, [rates, baseline]);

  const save = async () => {
    // Build one row per filled-in combination: optionIds (one per dimension) + ratePerSheet.
    const rows = combos
      .map((ids) => {
        const value = Number(rates[comboKey(ids)]);
        return isFlat
          ? { optionIds: ids, flatPrice: value }
          : { optionIds: ids, ratePerSheet: value };
      })
      .filter((r) => {
        const v = "flatPrice" in r ? r.flatPrice : r.ratePerSheet;
        return typeof v === "number" && Number.isFinite(v) && v > 0;
      });

    const ok = await confirm({
      title: "Update price matrix?",
      message: "This replaces all rates for this product. Empty cells will be removed.",
      confirmLabel: "Update matrix",
    });
    if (!ok) return;

    setSaving(true);
    try {
      const res = await admin.products.setMatrix(productId, rows);
      toast(`Saved ${res?.count ?? rows.length} price rows`, "success");
      await onReload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to save matrix", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">grid_on</span>
          <h2 className="font-headline-md text-[20px]">Price Matrix (₹ / sheet)</h2>
        </div>
        <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded-full uppercase">
          {matrix?.pricesIncludeGst ? "GST Inclusive" : "GST Exclusive"}
        </span>
      </div>

      <div className="p-6">
        {noDimensions ? (
          <p className="text-sm text-on-surface-variant">
            Mark at least one spec group as a <b>Pricing Dimension</b> and give it options to build the matrix.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-label-caps text-on-surface-variant border-b border-outline-variant">
                    {dims.map((d) => (
                      <th key={d.id} scope="col" className="pb-3 px-2">{d.name}</th>
                    ))}
                    <th scope="col" className="pb-3 px-2">₹ / Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {combos.map((ids) => {
                    const key = comboKey(ids);
                    const hasSaved = norm(baseline[key]) !== "";
                    const label = `${priceLabel} for ${ids.map((oid) => optName.get(oid) ?? oid).join(" / ")}`;
                    return (
                      <tr key={key} className={`transition-colors ${hasSaved ? "bg-secondary-container/5" : "hover:bg-surface-container-lowest"}`}>
                        {ids.map((oid, di) => (
                          <td key={dims[di].id} className="py-3 px-2 text-sm font-medium text-on-surface">
                            {optName.get(oid) ?? oid}
                            {di === 0 && hasSaved && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-secondary-container align-middle" title="Price set" aria-hidden="true"></span>}
                          </td>
                        ))}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            aria-label={label}
                            value={rates[key] ?? ""}
                            onChange={(e) => setRates((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="w-28 border border-surface-container bg-surface-container-low rounded-lg p-2 focus:ring-2 focus:ring-secondary-container"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button onClick={save} disabled={saving || !dirty} className="px-6 py-3 primary-accent-gradient text-white font-extrabold rounded-xl shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Saving…" : "Save Matrix"}
              </button>
              {dirty && (
                <span className="text-sm font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                  You have unsaved rate changes
                </span>
              )}
              <p className="text-[12px] text-on-surface-variant italic flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">info</span>
                {combos.length} combinations · blank or zero rates are skipped.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

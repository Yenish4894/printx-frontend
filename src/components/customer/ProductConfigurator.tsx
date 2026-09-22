"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { catalog, cart as cartApi, ApiError, type PriceBreakdown } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";
import { evaluateVisibility, pruneSelections, type VisibilityRuleLite } from "@/lib/visibility";
import { useToast } from "@/components/ui/UIProvider";
import Button from "@/components/ui/Button";

interface Option {
  id: string;
  name: string;
  description?: string | null;
  addOnType: "FLAT" | "PER_UNIT";
  addOnValue: number;
  perQuantity: number;
  isDefault: boolean;
  quantityValue?: number | null;
  code?: string | null;
}
interface SpecGroup {
  id: string;
  name: string;
  selectionType: "SINGLE_SELECT" | "MULTI_SELECT";
  isPricingDimension: boolean;
  isQuantityDimension?: boolean;
  isRequired: boolean;
  options: Option[];
}
interface DeliverySpeed {
  id: string;
  name: string;
  fee: number;
  etaMinDays: number;
  etaMaxDays: number;
}
interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: { name: string; slug: string };
  pricingModel: "TIERED" | "PER_UNIT" | "MATRIX";
  minQuantity: number;
  maxQuantity?: number | null;
  quantityStep?: number;
  pricesIncludeGst: boolean;
  singlePrintThreshold: number | null;
  singlePrintRate: number | null;
  printTypeLabel?: string | null;
  standardSizeLabel?: string | null;
  badges: string[];
  specGroups: SpecGroup[];
  quantityTiers: { id: string; quantity: number; basePrice: number; label?: string | null }[];
  deliverySpeeds: DeliverySpeed[];
  visibilityRules?: VisibilityRuleLite[];
}

const QTY_CHIPS = [50, 100, 250, 500, 1000];

export default function ProductConfigurator({ slug }: { slug: string }) {
  const router = useRouter();
  const { refresh } = useSession();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [qty, setQty] = useState(1);
  const [deliveryId, setDeliveryId] = useState<string | undefined>(undefined);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const quoteSeq = useRef(0); // guards against out-of-order quote responses

  // Toggle an option; MULTI_SELECT groups keep an array, SINGLE_SELECT replaces.
  const toggleOption = (g: SpecGroup, optId: string) =>
    setSelections((s) => {
      if (g.selectionType === "MULTI_SELECT") {
        const cur = Array.isArray(s[g.id]) ? (s[g.id] as string[]) : s[g.id] ? [s[g.id] as string] : [];
        return { ...s, [g.id]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
      }
      return { ...s, [g.id]: optId };
    });
  const isSelected = (gId: string, optId: string) => {
    const v = selections[gId];
    return Array.isArray(v) ? v.includes(optId) : v === optId;
  };

  // Load product + initialise defaults.
  useEffect(() => {
    let alive = true;
    catalog
      .product(slug)
      .then(({ product }) => {
        if (!alive) return;
        const p = product as unknown as Product;
        setProduct(p);
        const init: Record<string, string> = {};
        for (const g of p.specGroups) {
          const def = g.options.find((o) => o.isDefault) ?? g.options[0];
          if (def && (g.isRequired || g.isPricingDimension)) init[g.id] = def.id;
          else if (def) init[g.id] = def.id;
        }
        setSelections(init);
        // Default to a realistic quantity. For MATRIX products with a single-print
        // threshold, start above it so the real per-sheet matrix price shows (not the
        // flat single-print rate).
        const defaultQty =
          p.quantityTiers[0]?.quantity ??
          (p.pricingModel === "MATRIX" && p.singlePrintThreshold
            ? Math.max(100, p.singlePrintThreshold)
            : Math.max(1, p.minQuantity));
        // Start on a quantity the server will accept (>= min, on a valid step).
        const step = Math.max(1, p.quantityStep ?? 1);
        const snapped =
          step > 1
            ? p.minQuantity + Math.max(0, Math.round((defaultQty - p.minQuantity) / step)) * step
            : Math.max(defaultQty, p.minQuantity);
        setQty(snapped);
        setDeliveryId(p.deliverySpeeds[0]?.id);
      })
      .catch((e) => alive && setLoadErr(e instanceof ApiError ? e.message : "Failed to load product"));
    return () => {
      alive = false;
    };
  }, [slug]);

  // Debounced live quote.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runQuote = useCallback(() => {
    if (!product) return;
    const seq = ++quoteSeq.current;
    setQuoting(true);
    setQuoteErr(null);
    catalog
      .quote({
        productId: product.id,
        quantity: qty,
        selections,
        deliverySpeedId: deliveryId,
      })
      .then(({ quote }) => {
        if (seq !== quoteSeq.current) return; // a newer request superseded this one
        setBreakdown(quote.breakdown);
      })
      .catch((e) => {
        if (seq !== quoteSeq.current) return;
        setBreakdown(null);
        setQuoteErr(e instanceof ApiError ? e.message : "Could not price this combination");
      })
      .finally(() => {
        if (seq === quoteSeq.current) setQuoting(false);
      });
  }, [product, qty, selections, deliveryId]);

  useEffect(() => {
    if (!product) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(runQuote, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [product, runQuote]);

  // Which groups/options are conditionally hidden right now. The server
  // re-evaluates the same rules, so the UI can never offer something the
  // pricing path would reject.
  const visibility = useMemo(
    () => evaluateVisibility(product?.visibilityRules ?? [], selections),
    [product, selections],
  );
  const visibleGroups = useMemo(
    () => (product?.specGroups ?? []).filter((g) => !visibility.hiddenGroupIds.has(g.id)),
    [product, visibility],
  );

  // A product whose quantity is a spec (fixed slabs) drives qty from the
  // selected option instead of the numeric stepper.
  const slabGroup = useMemo(
    () => visibleGroups.find((g) => g.isQuantityDimension) ?? null,
    [visibleGroups],
  );
  const slabQty = useMemo(() => {
    if (!slabGroup) return null;
    const sel = selections[slabGroup.id];
    const id = Array.isArray(sel) ? sel[0] : sel;
    return slabGroup.options.find((o) => o.id === id)?.quantityValue ?? null;
  }, [slabGroup, selections]);

  // Drop any selection that a rule has just hidden, so we never quote (or add
  // to cart) an option the customer can no longer see.
  useEffect(() => {
    if (!product?.visibilityRules?.length) return;
    const pruned = pruneSelections(selections, visibility);
    if (Object.keys(pruned).length !== Object.keys(selections).length) {
      setSelections(pruned);
    }
  }, [product, selections, visibility]);

  // Keep the quoted quantity in step with the selected slab.
  useEffect(() => {
    if (slabQty != null && slabQty !== qty) setQty(slabQty);
  }, [slabQty, qty]);

  const total = breakdown?.total ?? 0;
  // Quantity rules come from the product, not from constants — a product with
  // minQuantity 1000 / step 1000 must never be offered 50, and the +/- buttons
  // must move by a step the server will accept.
  const minQty = Math.max(1, product?.minQuantity ?? 1);
  const qtyStep = Math.max(1, product?.quantityStep ?? 1);
  const maxQty = product?.maxQuantity ?? 1_000_000;

  /** Clamp into [min, max] and land on a valid step above the minimum. */
  const snapQty = useCallback(
    (n: number) => {
      const clamped = Math.min(maxQty, Math.max(minQty, Number.isFinite(n) ? n : minQty));
      if (qtyStep <= 1) return clamped;
      const steps = Math.round((clamped - minQty) / qtyStep);
      return Math.min(maxQty, minQty + Math.max(0, steps) * qtyStep);
    },
    [minQty, maxQty, qtyStep],
  );

  // Preset chips: the product's own tiers if it has them, else the first few
  // valid steps from the minimum.
  const qtyChips = useMemo(() => {
    if (product?.quantityTiers.length) return product.quantityTiers.map((t) => t.quantity);
    if (qtyStep > 1 || minQty > 1) {
      return [0, 1, 2, 4, 9]
        .map((i) => minQty + i * qtyStep)
        .filter((n) => n <= maxQty);
    }
    return QTY_CHIPS;
  }, [product, minQty, maxQty, qtyStep]);

  const qtyError =
    qty < minQty
      ? `Minimum order is ${minQty.toLocaleString("en-IN")}.`
      : qty > maxQty
        ? `Maximum order is ${maxQty.toLocaleString("en-IN")}.`
        : qtyStep > 1 && (qty - minQty) % qtyStep !== 0
          ? `Quantity must be in multiples of ${qtyStep.toLocaleString("en-IN")} from ${minQty.toLocaleString("en-IN")}.`
          : null;

  const selectedSummary = useMemo(() => {
    if (!product) return "";
    return visibleGroups
      .flatMap((g) => {
        const v = selections[g.id];
        const ids = Array.isArray(v) ? v : v ? [v] : [];
        return ids.map((id) => g.options.find((o) => o.id === id)?.name);
      })
      .filter(Boolean)
      .join(" · ");
  }, [product, visibleGroups, selections]);

  async function addToCart(thenCheckout: boolean) {
    if (!product || !breakdown) return;
    setAdding(true);
    try {
      const res = await cartApi.add({
        productId: product.id,
        quantity: qty,
        selections,
        deliverySpeedId: deliveryId,
        notes: notes || undefined,
      });
      // upload artwork to the newest cart item if a file was chosen
      let uploadFailed = false;
      if (file && res?.items?.length) {
        const newest = res.items[res.items.length - 1];
        try {
          await cartApi.uploadFile(newest.id, file);
        } catch {
          uploadFailed = true;
        }
      }
      refresh();
      if (uploadFailed) {
        toast("Added to cart, but the artwork upload failed — upload it from your cart.", "error");
      }
      if (thenCheckout) {
        router.push("/cart");
      } else if (!uploadFailed) {
        toast("Added to cart", "success");
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not add to cart", "error");
    } finally {
      setAdding(false);
    }
  }

  if (loadErr) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-24 text-center">
        <p className="font-headline-md text-headline-md text-primary-container mb-4">{loadErr}</p>
        <Link href="/products" className="text-secondary font-button">← Back to catalog</Link>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-24 text-center text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        <p className="mt-4">Loading product…</p>
      </main>
    );
  }

  const cardCls = (active: boolean) =>
    active
      ? "p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left transition-all custom-shadow flex flex-col justify-between"
      : "p-4 rounded-xl border-2 border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all flex flex-col justify-between";

  const optionLabel = (g: SpecGroup, o: Option) => {
    const parts = [o.name];
    if (o.code) parts.push(`Code ${o.code}`);
    if (!g.isPricingDimension && o.addOnValue > 0) parts.push(addOnTag(o));
    return parts.join("  ·  ");
  };

  const addOnTag = (o: Option) =>
    o.addOnValue > 0
      ? "+" + inr(o.addOnValue) + (o.addOnType === "PER_UNIT" ? (o.perQuantity > 1 ? `/${o.perQuantity}` : "/unit") : "")
      : "Included";

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 mb-4 text-on-surface-variant font-label-caps text-label-caps">
          <Link className="hover:text-secondary" href="/dashboard">Home</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link className="hover:text-secondary" href="/products">Products</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>
        {product.badges?.[0] && (
          <div className="mb-2">
            <span className="bg-secondary-container/10 text-secondary px-3 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-wider font-bold">{product.badges[0]}</span>
          </div>
        )}
        <h1 className="font-headline-lg text-headline-lg text-primary-container">{product.name}</h1>
        {product.description && <p className="text-on-surface-variant mt-2 max-w-2xl">{product.description}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left: Details */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-6">
            <h2 className="font-headline-md text-headline-md text-primary-container mb-6 flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary-container">description</span> Product Details
            </h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {product.printTypeLabel && (
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Print Type</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{product.printTypeLabel}</p>
                </div>
              )}
              {product.standardSizeLabel && (
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Standard Size</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{product.standardSizeLabel}</p>
                </div>
              )}
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Category</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">{product.category.name}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Min. Order</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">{product.minQuantity.toLocaleString("en-IN")}</p>
              </div>
            </div>
            {product.pricingModel === "MATRIX" && product.singlePrintThreshold && (
              <p className="mt-6 text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">
                Orders under {product.singlePrintThreshold} sheets are billed at a flat {inr(product.singlePrintRate ?? 0)}/sheet.
              </p>
            )}
          </div>
        </div>

        {/* Middle: Configurator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="header-deep-gradient rounded-xl p-8 text-on-primary shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="font-headline-md text-headline-md text-white mb-1">{product.name}</p>
                <p className="text-on-tertiary-container font-body-md">{selectedSummary}</p>
              </div>
              <div className="text-right">
                <div className="flex items-end gap-2 justify-end">
                  <span className="text-4xl font-black text-secondary-container">{breakdown ? inr(total) : "—"}</span>
                  <span className="text-on-tertiary-container font-label-caps text-sm mb-1 pb-1">/ {qty.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg py-2 px-4 flex items-center gap-3 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${quoting ? "bg-amber-400 animate-pulse" : "bg-[#00c853] pulse-dot"}`}></div>
              <span className="text-label-caps font-label-caps tracking-wide font-bold">
                {quoting ? "Updating price…" : "Live Pricing Active — price updates instantly"}
              </span>
            </div>
          </div>

          <div className="space-y-8 pb-32 lg:pb-0">
            {/* Dynamic spec groups */}
            {visibleGroups.map((g) => (
              <section key={g.id} role="group" aria-label={g.name}>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{g.isPricingDimension ? "tune" : "flare"}</span>
                  {g.name}
                  {g.selectionType === "MULTI_SELECT" && <span className="text-[10px] normal-case tracking-normal text-on-surface-variant">(choose any)</span>}
                  {!g.isRequired && g.selectionType !== "MULTI_SELECT" && <span className="text-[10px] normal-case tracking-normal text-on-surface-variant">(optional)</span>}
                </h3>
                {g.selectionType === "SINGLE_SELECT" ? (
                  // Single-choice groups are dropdowns (matching how the trade
                  // portal presents them) — compact, and it scales to the long
                  // option lists on paper/size groups.
                  <select
                    aria-label={g.name}
                    value={(selections[g.id] as string) ?? ""}
                    onChange={(e) =>
                      setSelections((prev) => {
                        const v = e.target.value;
                        if (!v) {
                          const next = { ...prev };
                          delete next[g.id];
                          return next;
                        }
                        return { ...prev, [g.id]: v };
                      })
                    }
                    className="w-full max-w-md p-4 rounded-xl border-2 border-outline-variant bg-white font-bold text-primary-container focus:border-secondary-container focus:outline-none focus:ring-0 transition-colors"
                  >
                    {/* A required group can show the placeholder but not be reset to it. */}
                    <option value="" disabled={g.isRequired}>
                      Select {g.name.replace(/\.$/, "")}…
                    </option>
                    {g.options
                      .filter((o) => !visibility.hiddenOptionIds.has(o.id))
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {optionLabel(g, o)}
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {g.options.filter((o) => !visibility.hiddenOptionIds.has(o.id)).map((o) => {
                      const active = isSelected(g.id, o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleOption(g, o.id)}
                          className={cardCls(active)}
                        >
                          <span className="font-bold text-primary-container">{o.name}</span>
                          {o.code && <span className="text-[10px] text-on-surface-variant mt-0.5">Code {o.code}</span>}
                          <span className={`font-label-caps text-[10px] uppercase mt-2 ${active ? "text-secondary font-black" : "text-on-surface-variant font-bold"}`}>
                            {addOnTag(o)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}

            {/* Quantity — hidden when a spec group already IS the quantity
                (fixed slabs, e.g. letterheads): the slab buttons above set it. */}
            {!slabGroup && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">reorder</span> Quantity
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {qtyChips.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQty(n)}
                    aria-pressed={qty === n}
                    className={qty === n ? "px-4 py-2 rounded-full border-2 border-secondary bg-secondary text-white font-bold text-sm" : "px-4 py-2 rounded-full border border-outline-variant bg-white text-on-surface-variant font-bold text-sm hover:border-secondary-container/50 transition-colors"}
                  >
                    {n.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl max-w-xs">
                <label htmlFor="qty-input" className="text-label-caps font-bold text-on-surface-variant">Custom Qty:</label>
                <div className="flex items-center bg-white rounded-lg border border-outline-variant">
                  <button type="button" aria-label={`Decrease quantity by ${qtyStep}`} onClick={() => setQty((q) => snapQty(q - qtyStep))} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined" aria-hidden="true">remove</span></button>
                  <input
                    id="qty-input"
                    className="w-20 border-none text-center font-bold text-primary-container focus:ring-0"
                    type="number"
                    inputMode="numeric"
                    min={minQty}
                    max={maxQty}
                    step={qtyStep}
                    value={qty}
                    // Typing stays unrestricted so the field doesn't fight the
                    // user mid-entry; the value is snapped to a valid step on blur.
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setQty(Number.isNaN(n) ? minQty : n);
                    }}
                    onBlur={() => setQty((q) => snapQty(q))}
                  />
                  <button type="button" aria-label={`Increase quantity by ${qtyStep}`} onClick={() => setQty((q) => snapQty(q + qtyStep))} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined" aria-hidden="true">add</span></button>
                </div>
              </div>
              {qtyError && <p className="text-xs text-error mt-2">{qtyError}</p>}
              {!qtyError && qtyStep > 1 && (
                <p className="text-xs text-on-surface-variant mt-2">
                  Sold in multiples of {qtyStep.toLocaleString("en-IN")}.
                </p>
              )}
            </section>
            )}

            {/* Delivery Speed */}
            {product.deliverySpeeds.length > 0 && (
              <section>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">local_shipping</span> Delivery Speed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {product.deliverySpeeds.map((d) => {
                    const active = deliveryId === d.id;
                    return (
                      <button key={d.id} type="button" aria-pressed={active} onClick={() => setDeliveryId(d.id)} className={active ? "p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left custom-shadow" : "p-4 rounded-xl border border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all"}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`material-symbols-outlined ${active ? "text-secondary-container" : "text-on-surface-variant"}`} aria-hidden="true">local_shipping</span>
                          <span className="font-bold text-primary-container">{d.fee === 0 ? "FREE" : "+" + inr(d.fee)}</span>
                        </div>
                        <p className="font-bold text-primary-container">{d.name}</p>
                        <p className="text-xs text-on-surface-variant">{d.etaMinDays}–{d.etaMaxDays} business days</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Upload */}
            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">cloud_upload</span> Upload Artwork
              </h3>
              <label className="border-2 border-dashed border-outline-variant bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center group hover:border-secondary-container focus-within:border-secondary-container focus-within:ring-2 focus-within:ring-secondary/30 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">upload_file</span>
                </div>
                <p className="font-bold text-primary-container mb-1">{file ? file.name : "Click to upload your artwork"}</p>
                <p className="text-xs text-on-surface-variant mb-4">PDF, AI, PSD, PNG, JPG (max 50 MB)</p>
                <span className="bg-white/50 text-label-caps font-label-caps px-3 py-1 rounded-full text-on-surface-variant italic">Optional — you can also upload after payment</span>
                {/* sr-only keeps the input keyboard-focusable (unlike hidden) */}
                <input type="file" className="sr-only" accept=".pdf,.ai,.psd,.png,.jpg,.jpeg" aria-label="Upload artwork file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              {file && (
                <button type="button" onClick={() => setFile(null)} className="mt-2 text-xs text-error hover:underline">Remove file</button>
              )}
            </section>

            {/* Special Instructions */}
            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">edit_note</span> Special Instructions
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-white p-4 font-body-md text-on-surface focus:ring-secondary-container focus:border-secondary-container"
                placeholder="e.g. Any specific colour matching or finishing notes..."
                rows={3}
              />
            </section>
          </div>
        </div>

        {/* Right: Order Summary (sticky) */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 bg-surface-container-lowest rounded-xl custom-shadow p-6 border border-outline-variant/10">
            <h2 className="font-headline-md text-headline-md text-primary-container mb-6">Order Summary</h2>

            {quoteErr ? (
              <div className="mb-6 px-4 py-3 rounded-lg bg-error-container/60 text-on-error-container text-sm flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">info</span>
                <span>{quoteErr}</span>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Subtotal (taxable)</span>
                  <span className="font-bold">{breakdown ? inr(breakdown.goodsTaxable) : "—"}</span>
                </div>
                {breakdown && breakdown.delivery > 0 && (
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Delivery</span>
                    <span className="font-bold">{inr(breakdown.delivery)}</span>
                  </div>
                )}
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">GST (18%)</span>
                  <span className="font-bold">{breakdown ? inr(breakdown.gst) : "—"}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-8 pt-4 border-t border-outline-variant/30">
              <span className="font-headline-md text-headline-md text-primary-container">Total</span>
              <div className="text-right">
                <span className="text-3xl font-black text-secondary">{breakdown ? inr(total) : "—"}</span>
                <p className="text-[10px] text-on-surface-variant font-label-caps">INCL. ALL TAXES</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg flex items-center gap-2 mb-2 bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">account_balance</span>
                <span className="text-body-md">Pay by bank transfer after you place the order.</span>
              </div>

              <Button
                size="lg"
                fullWidth
                disabled={!breakdown}
                loading={adding}
                onClick={() => addToCart(true)}
                iconAfter="payments"
              >
                {adding ? "Adding…" : "Add & checkout"}
              </Button>
              <Button
                size="lg"
                fullWidth
                variant="secondary"
                disabled={!breakdown || adding}
                onClick={() => addToCart(false)}
                iconAfter="shopping_cart"
              >
                Add to cart
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-on-surface-variant font-label-caps uppercase">Total (incl. GST)</p>
          <p className="text-xl font-black text-secondary">{breakdown ? inr(total) : "—"}</p>
        </div>
        <Button
          disabled={!breakdown}
          loading={adding}
          onClick={() => addToCart(true)}
          className="flex-1 max-w-[62%]"
        >
          {adding ? "Adding…" : "Add & checkout"}
        </Button>
      </div>
    </main>
  );
}

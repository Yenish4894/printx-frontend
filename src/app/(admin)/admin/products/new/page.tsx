"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

type PricingModel = "TIERED" | "PER_UNIT" | "MATRIX";

const pricingOptions: { value: PricingModel; title: string; hint: string }[] = [
  { value: "TIERED", title: "Tiered Pricing", hint: "Price reduces with higher quantities" },
  { value: "PER_UNIT", title: "Per-Unit Pricing", hint: "Fixed cost per unit produced" },
  { value: "MATRIX", title: "Matrix Pricing", hint: "Rate per sheet by spec combination" },
];

export default function NewProduct() {
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("TIERED");
  const [minQuantity, setMinQuantity] = useState("1");
  const [pricesIncludeGst, setPricesIncludeGst] = useState(false);
  const [singlePrintThreshold, setSinglePrintThreshold] = useState("");
  const [singlePrintRate, setSinglePrintRate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await admin.categories.list();
        const cats = res.categories as Category[];
        setCategories(cats);
        if (cats.length) setCategoryId(cats[0].id);
      } catch (e) {
        setCatError(e instanceof ApiError ? e.message : "Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setCategoryError(null);

    let hasError = false;
    let banner: string | null = null;
    if (!categoryId) {
      setCategoryError("Please select a category");
      hasError = true;
    }
    if (!name.trim()) {
      setNameError("Product name is required");
      hasError = true;
    }

    if (pricingModel === "MATRIX") {
      if (singlePrintThreshold && Number(singlePrintThreshold) < 0) {
        banner = "Single print threshold must be 0 or more";
        hasError = true;
      }
      if (singlePrintRate && Number(singlePrintRate) < 0) {
        banner = "Single print rate must be 0 or more";
        hasError = true;
      }
    }

    if (hasError) {
      setError(banner ?? "Please fix the highlighted fields");
      return;
    }

    const input: Record<string, unknown> = {
      categoryId,
      name: name.trim(),
      pricingModel,
      description: description.trim() || null,
      minQuantity: Number(minQuantity) || 1,
    };

    if (pricingModel === "MATRIX") {
      input.pricesIncludeGst = pricesIncludeGst;
      input.singlePrintThreshold = singlePrintThreshold ? Number(singlePrintThreshold) : null;
      input.singlePrintRate = singlePrintRate ? Number(singlePrintRate) : null;
    }

    setSubmitting(true);
    try {
      const res = await admin.products.create(input);
      toast("Product created", "success");
      router.push(`/admin/spec-config?product=${res.product.id}`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to create product";
      setError(msg);
      toast(msg, "error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps mb-2">
            <Link className="hover:text-secondary-container" href="/admin/products">Products</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">New Product</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Create Product</h2>
          <p className="text-body-md text-on-surface-variant">Set the primary details, then configure specs and pricing on the next step.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-body-md text-error" role="alert">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-24">
        {/* Main form */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container">info</span> Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="product-name" className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Product Name</label>
                <input
                  id="product-name"
                  className={`w-full bg-surface border rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary ${nameError ? "border-error" : "border-outline-variant/30"}`}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
                  placeholder="e.g., Business Cards"
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? "product-name-error" : undefined}
                  required
                />
                {nameError && <p id="product-name-error" className="mt-2 text-label-caps text-error">{nameError}</p>}
              </div>
              <div>
                <label htmlFor="product-category" className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Category</label>
                <select
                  id="product-category"
                  className={`w-full bg-surface border rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary ${categoryError ? "border-error" : "border-outline-variant/30"}`}
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); if (categoryError) setCategoryError(null); }}
                  disabled={catLoading || categories.length === 0}
                  aria-invalid={categoryError ? true : undefined}
                  aria-describedby={categoryError ? "product-category-error" : undefined}
                >
                  {catLoading && <option>Loading…</option>}
                  {!catLoading && categories.length === 0 && <option value="">No categories — create one first</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>
                  ))}
                </select>
                {categoryError && <p id="product-category-error" className="mt-2 text-label-caps text-error">{categoryError}</p>}
                {catError && <p className="mt-2 text-label-caps text-error">{catError}</p>}
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Min Order Qty (MOQ)</label>
                <input
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary"
                  type="number"
                  min={1}
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Description</label>
                <textarea
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short marketing description shown to customers."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section className="bg-primary-container text-white rounded-xl shadow-xl p-8 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/20 blur-3xl rounded-full"></div>
            <h3 className="font-headline-md text-headline-md mb-6 relative z-10 flex items-center gap-2 text-white"><span className="material-symbols-outlined">payments</span> Pricing Model</h3>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                {pricingOptions.map((opt) => {
                  const active = pricingModel === opt.value;
                  return (
                    <label key={opt.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${active ? "border-secondary-container bg-secondary-container/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                      <input
                        className="text-secondary-container bg-transparent border-white/30"
                        name="pricing"
                        type="radio"
                        checked={active}
                        onChange={() => setPricingModel(opt.value)}
                      />
                      <div className="ml-3"><p className="text-body-md font-bold">{opt.title}</p><p className="text-[10px] text-on-primary-container">{opt.hint}</p></div>
                    </label>
                  );
                })}
              </div>

              {pricingModel === "MATRIX" && (
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body-md text-on-primary-container">Prices Include GST</span>
                    <Switch checked={pricesIncludeGst} onChange={setPricesIncludeGst} label="Prices include GST" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-primary-container mb-1">Single Print Threshold</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-body-md"
                      type="number"
                      min={1}
                      value={singlePrintThreshold}
                      onChange={(e) => setSinglePrintThreshold(e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-primary-container mb-1">Single Print Rate (₹)</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-body-md"
                      type="number"
                      min={0}
                      step="0.01"
                      value={singlePrintRate}
                      onChange={(e) => setSinglePrintRate(e.target.value)}
                      placeholder="e.g., 10.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-surface border-t border-outline-variant px-4 md:px-margin-desktop py-4 flex items-center justify-end gap-4">
        <Link href="/admin/products" className="px-6 py-3 rounded-lg border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</Link>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-lg primary-accent-gradient text-white font-button shadow-lg shadow-secondary/20 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create & Configure Specs"}
        </button>
      </div>
    </form>
  );
}

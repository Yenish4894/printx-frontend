"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { catalog, ApiError } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: { slug: string; name: string; parent?: { slug: string; name: string } | null };
  badges: string[];
  priceFrom: number | null;
  image: string | null;
}

function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link href={`/products/${p.slug}`} className="bento-card group flex flex-col bg-surface border border-outline-variant rounded-3xl overflow-hidden shadow-sm hover:shadow-xl">
      <div className="aspect-[4/3] bg-surface-container relative overflow-hidden flex items-center justify-center">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={p.image} />
        ) : (
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30" aria-hidden="true">print</span>
        )}
        {p.badges?.[0] && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter bg-secondary text-white">{p.badges[0]}</span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{p.category.name}</span>
          <h3 className="font-headline-md text-[20px]">{p.name}</h3>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{p.description}</p>
        <div className="mt-auto pt-6 border-t border-outline-variant flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{p.priceFrom ? "STARTING FROM" : "LIVE PRICING"}</span>
            <span className="font-price-lg text-price-lg">{p.priceFrom ? inr(p.priceFrom) : "Configure →"}</span>
          </div>
          <span className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center group-hover:bg-secondary transition-all active:scale-90">
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsListing() {
  const { user } = useSession();
  const [allProducts, setAllProducts] = useState<ProductCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Two-level browse: pick a top category, then optionally narrow to one of its
  // sub-categories (e.g. Letterheads → 100 GSM Bond).
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [subCategory, setSubCategory] = useState<string | undefined>(undefined);

  // Fetch the full catalogue once; filter client-side so the category bar stays
  // stable and switching categories never refetches (no collapse, no races).
  const load = useCallback(() => {
    setAllProducts(null);
    setError(null);
    catalog
      .products()
      .then((r) => setAllProducts(r.products as unknown as ProductCardData[]))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load products"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Top-level list derived from the FULL catalogue (stable across filtering):
  // a product under a sub-category is filed under its parent.
  const topOf = (p: ProductCardData) => p.category.parent ?? p.category;
  const categories = Array.from(
    new Map((allProducts ?? []).map((p) => [topOf(p).slug, topOf(p).name])).entries(),
  );
  // Sub-categories of the selected top category, if it has any.
  const subCategories = category
    ? Array.from(
        new Map(
          (allProducts ?? [])
            .filter((p) => p.category.parent?.slug === category)
            .map((p) => [p.category.slug, p.category.name]),
        ).entries(),
      )
    : [];

  const products = allProducts
    ? allProducts.filter((p) => {
        if (subCategory) return p.category.slug === subCategory;
        if (category) return topOf(p).slug === category;
        return true;
      })
    : null;

  return (
    <>
      {/* Sub Header */}
      <div className="header-gradient text-white">
        <div className="max-w-container-max mx-auto px-gutter py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-on-primary-container font-label-caps mb-4">
                <Link className="hover:text-white transition-colors" href="/dashboard">HOME</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-white">PRINT CATALOG</span>
              </nav>
              <h1 className="font-display-lg text-display-lg font-extrabold mb-2 leading-none">The Print Studio</h1>
              <p className="text-on-primary-container font-body-lg">Premium materials. Industrial precision. Live pricing.</p>
            </div>
            <div className="flex items-center gap-4 bg-primary-container/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="flex flex-col text-right">
                <span className="font-label-caps text-on-primary-container opacity-80">ACCOUNT BALANCE</span>
                <span className="font-price-lg text-price-lg text-secondary-container">{inr(user?.walletBalance)}</span>
              </div>
              <div className="bg-secondary-container/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-secondary-container" style={fill1}>account_balance_wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="max-w-container-max mx-auto px-gutter -mt-8 relative z-10">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => { setCategory(undefined); setSubCategory(undefined); }}
            aria-pressed={!category}
            className={`flex-none bg-surface border px-6 py-4 rounded-xl flex items-center gap-3 hover:border-secondary transition-all ${!category ? "border-secondary shadow-lg" : "border-outline-variant shadow-sm"}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">apps</span>
            <span className="font-button text-button">All Products</span>
          </button>
          {categories.map(([slug, name]) => (
            <button
              key={slug}
              onClick={() => { setCategory(slug); setSubCategory(undefined); }}
              aria-pressed={category === slug}
              className={`flex-none bg-surface border px-6 py-4 rounded-xl flex items-center gap-3 hover:border-secondary transition-all ${category === slug ? "border-secondary shadow-lg" : "border-outline-variant shadow-sm"}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">category</span>
              <span className="font-button text-button">{name}</span>
            </button>
          ))}
        </div>

        {/* Second level — only when the chosen category actually has children. */}
        {subCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar" aria-label="Sub-categories">
            <button
              onClick={() => setSubCategory(undefined)}
              aria-pressed={!subCategory}
              className={`flex-none px-4 py-2 rounded-full text-sm font-bold border transition-all ${!subCategory ? "border-secondary bg-secondary text-white" : "border-outline-variant bg-surface text-on-surface-variant hover:border-secondary"}`}
            >
              All
            </button>
            {subCategories.map(([slug, name]) => (
              <button
                key={slug}
                onClick={() => setSubCategory(slug)}
                aria-pressed={subCategory === slug}
                className={`flex-none px-4 py-2 rounded-full text-sm font-bold border transition-all ${subCategory === slug ? "border-secondary bg-secondary text-white" : "border-outline-variant bg-surface text-on-surface-variant hover:border-secondary"}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <main className="max-w-container-max mx-auto px-gutter py-12">
        {error ? (
          <div className="py-20 text-center" role="alert">
            <span className="material-symbols-outlined text-5xl text-error/70 mb-3" aria-hidden="true">error</span>
            <p className="text-on-surface font-bold mb-1">Couldn&apos;t load the catalogue</p>
            <p className="text-on-surface-variant text-sm mb-5">{error}</p>
            <button onClick={load} className="primary-accent-gradient text-white px-6 py-2.5 rounded-lg font-button inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">refresh</span> Try again
            </button>
          </div>
        ) : !products ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-3xl border border-outline-variant bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4" aria-hidden="true">inventory_2</span>
            <p>{category ? "No products in this category yet." : "No products available yet."}</p>
            {category && (
              <button onClick={() => setCategory(undefined)} className="mt-4 text-secondary font-button hover:underline">
                View all products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

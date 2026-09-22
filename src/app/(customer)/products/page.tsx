"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { catalog, ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import ScrollRow from "@/components/ui/ScrollRow";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { inr } from "@/components/SessionProvider";


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
    <Link href={`/products/${p.slug}`} className="bento-card group flex flex-col bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-xl">
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
          <h2 className="font-headline-md text-[20px]">{p.name}</h2>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{p.description}</p>
        <div className="mt-auto pt-6 border-t border-outline-variant flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{p.priceFrom ? "STARTING FROM" : "LIVE PRICING"}</span>
            <span className="font-price-lg text-price-lg">{p.priceFrom ? inr(p.priceFrom) : "Configure →"}</span>
          </div>
          <span className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center group-hover:bg-secondary transition-all active:scale-90">
            <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsListing() {
  const [allProducts, setAllProducts] = useState<ProductCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Two-level browse: pick a top category, then optionally narrow to one of its
  // sub-categories (e.g. Letterheads → 100 GSM Bond).
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [subCategory, setSubCategory] = useState<string | undefined>(undefined);

  // Fetch the full catalogue once; filter client-side so the category bar stays
  // stable and switching categories never refetches (no collapse, no races).
  // The single unbounded query behind this is now a sequence of bounded pages:
  // same result, but one runaway table cannot take the page down.
  const load = useCallback(() => {
    setAllProducts(null);
    setError(null);
    (async () => {
      const PAGE_SIZE = 200;
      const MAX_PAGES = 20; // 4,000 products — a hard stop, not an expectation
      const acc: ProductCardData[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const r = await catalog.products(undefined, { page, pageSize: PAGE_SIZE });
        acc.push(...(r.products as unknown as ProductCardData[]));
        if (!r.hasMore) break;
      }
      return acc;
    })()
      .then(setAllProducts)
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
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-white">PRINT CATALOG</span>
              </nav>
              {/* Was "The Print Studio" — a made-up name unconnected to the
                  actual business, while every other page ties back to
                  Bhagini Graphics (the logo in the nav above, for one). */}
              <h1 className="font-display-lg text-display-lg font-extrabold mb-2 leading-none">Our Print Catalog</h1>
              <p className="text-on-primary-container font-body-lg">Premium materials. Industrial precision. Live pricing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="max-w-container-max mx-auto px-gutter -mt-8 relative z-10">
        <ScrollRow className="gap-4 pb-4" ariaLabel="Categories">
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
        </ScrollRow>

        {/* Second level — only when the chosen category actually has children. */}
        {subCategories.length > 0 && (
          <ScrollRow className="gap-2 pb-4" ariaLabel="Sub-categories">
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
          </ScrollRow>
        )}
      </div>

      {/* Grid */}
      <main className="max-w-container-max mx-auto px-gutter py-12">
        {error ? (
          <ErrorState title="Could not load the catalogue" message={error} onRetry={load} />
        ) : !products ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-outline-variant bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title={category ? "Nothing in this category yet" : "No products available yet"}
            description={
              category
                ? "This category has no published products right now."
                : "The catalogue is being set up. Check back shortly."
            }
            action={
              category ? (
                <Button variant="secondary" onClick={() => setCategory(undefined)} icon="grid_view">
                  View all products
                </Button>
              ) : undefined
            }
          />
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

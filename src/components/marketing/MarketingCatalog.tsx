"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { catalog } from "@/lib/api";

interface Card {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: { name: string };
  image: string | null;
}

export default function MarketingCatalog() {
  const [products, setProducts] = useState<Card[] | null>(null);

  useEffect(() => {
    catalog
      .products()
      .then((r) => setProducts(r.products as unknown as Card[]))
      .catch(() => setProducts([]));
  }, []);

  if (!products) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-xl border border-outline-variant bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-on-surface-variant">Our catalogue is being updated. Please check back shortly.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className="group bg-white rounded-xl overflow-hidden border border-outline-variant hover:border-secondary/40 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="h-44 bg-surface-container flex items-center justify-center overflow-hidden">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} src={p.image} />
            ) : (
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">print</span>
            )}
          </div>
          <div className="p-6 flex flex-col flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{p.category.name}</span>
            <h4 className="font-headline-md text-[20px] text-primary mb-2">{p.name}</h4>
            <p className="text-on-surface-variant text-sm mb-5 line-clamp-2 flex-1">{p.description}</p>
            <span className="inline-flex items-center gap-1 font-button text-sm text-secondary group-hover:gap-2 transition-all">
              Configure &amp; get live pricing
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

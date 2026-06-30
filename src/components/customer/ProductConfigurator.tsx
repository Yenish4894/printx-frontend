"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Product, basePriceFor, inr } from "@/lib/products";


const DELIVERY = [
  { label: "Express", price: 99, eta: "1–2 business days", icon: "bolt" },
  { label: "Standard", price: 49, eta: "3–5 business days", icon: "schedule" },
  { label: "Economy", price: 0, eta: "5–7 business days", icon: "savings" },
];

const WALLET_BALANCE = 2450;

const REVIEWS = [
  {
    name: "Troopixel",
    meta: "Verified Purchase • 2 days ago",
    text: "The print quality is phenomenal — colours came out exactly as in our files. Highly recommend for any creative work.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKhex3XSSHWqudUxu-SL_80ynkX9ZQ1sASTHZs9eYyq0uoHkxL4Biv0Oq-Zh6GkCT_1_ubNMF3kNRF_n4LDGSqLHttcC8XZkMAoY58J-iHaNJ-g8W4oQO375cLCugAtpdVvNBmcuM1HXNbO03tCDI6dCqZ4RmvYPwxV-BrxOwBiFJ5PS-X-r5aSN7KVnPDtKOp4S8o7HtRIRj0sRPIVT7-8v43kIJY1JDsCoIsIOyZD9WHZQWbHZOThaOr1GqeOKpA2Q5OyCUk5Hk",
  },
  {
    name: "K D International",
    meta: "Verified Purchase • 1 week ago",
    text: "Premium finish and very secure packaging. The team handled our bulk order perfectly and delivered on time.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx7_dnmSgPqhMy05DVrTyWKbUcK7kxJfkKNADKpsEmsS_kO1lb4o2iHGGKcczeXM0yJeucQCDeMv_v7zhiLjJ0VpJvSxULnK6xz142n5pshPW6UpgiRyqFhfauMMz9_4x4IVqNt_a-WVxPLddNX9pPLN5Rd6B7vYmZOil5eG7tXC0sJhz4e3kDedS2IzwucZj1fCoRNVPD496cFm4DlRNHjf5ewTg-mIeJmm18FOjNJhKI9DDAfBpNFau7NE5QryYOpkmxxj7CgU0",
  },
];

const tag = (price: number, includedLabel = "Included") =>
  price === 0 ? includedLabel : "+" + inr(price);

export default function ProductConfigurator({ product, related }: { product: Product; related: Product[] }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [paperIdx, setPaperIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [sideIdx, setSideIdx] = useState(0);
  const [finIdx, setFinIdx] = useState(0);
  const [delIdx, setDelIdx] = useState(0);
  const [qty, setQty] = useState(product.qtyTiers[0].qty);

  const paper = product.papers?.[paperIdx];
  const size = product.sizes?.[sizeIdx];
  const side = product.sides && product.sides.length > 1 ? product.sides[sideIdx] : undefined;
  const fin = product.finishings?.[finIdx];
  const del = DELIVERY[delIdx];

  const sim = useMemo(() => {
    const base = basePriceFor(qty, product.qtyTiers);
    const addOns = (paper?.price ?? 0) + (size?.price ?? 0) + (side?.price ?? 0) + (fin?.price ?? 0);
    const total = base + addOns + del.price;
    return { base, total };
  }, [qty, product.qtyTiers, paper, size, side, fin, del]);

  const enough = sim.total <= WALLET_BALANCE;

  const summaryRows: [string, string, string][] = [
    [`Base Price (${qty.toLocaleString("en-IN")} ${product.unit})`, inr(sim.base), ""],
  ];
  if (paper) summaryRows.push([`Paper (${paper.label})`, tag(paper.price), paper.price === 0 ? "text-[#00c853]" : ""]);
  if (size) summaryRows.push([`Size (${size.label})`, tag(size.price), size.price === 0 ? "text-[#00c853]" : ""]);
  if (side) summaryRows.push([`Sides (${side.label})`, tag(side.price), side.price === 0 ? "text-[#00c853]" : ""]);
  if (fin) summaryRows.push([`Finishing (${fin.label})`, tag(fin.price, fin.label === "None" ? "None" : "Included"), fin.price === 0 ? "text-[#00c853]" : ""]);
  summaryRows.push([`Delivery (${del.label})`, del.price === 0 ? "FREE" : inr(del.price), del.price === 0 ? "text-[#00c853]" : ""]);

  const cardCls = (active: boolean) =>
    active
      ? "p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left transition-all custom-shadow flex flex-col justify-between"
      : "p-4 rounded-xl border-2 border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all flex flex-col justify-between";
  const pillCls = (active: boolean) =>
    active
      ? "py-3 px-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-center font-bold text-primary-container"
      : "py-3 px-4 rounded-xl border border-outline-variant bg-white text-center font-bold text-on-surface-variant hover:border-secondary-container/50 transition-colors";

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 mb-4 text-on-surface-variant font-label-caps text-label-caps">
          <Link className="hover:text-secondary" href="/dashboard">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link className="hover:text-secondary" href="/products">Products</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>
        {product.badge && (
          <div className="mb-2">
            <span className="bg-secondary-container/10 text-secondary px-3 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-wider font-bold">{product.badge}</span>
          </div>
        )}
        <h1 className="font-headline-lg text-headline-lg text-primary-container">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left: Showcase */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden group relative">
            <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors shadow-sm">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <div className="aspect-[4/3] bg-surface-container relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover" alt={product.name} src={product.thumbs[imgIdx]} />
              <button className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:bg-white transition-all shadow-md">
                <span className="material-symbols-outlined text-lg">zoom_in</span> Zoom
              </button>
            </div>
            <div className="p-4 flex gap-4 overflow-x-auto">
              {product.thumbs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer ${i === imgIdx ? "border-2 border-secondary-container" : "border border-outline-variant opacity-70 hover:opacity-100 transition-opacity"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="thumbnail" src={t} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-6">
            <h3 className="font-headline-md text-headline-md text-primary-container mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">description</span> Product Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {product.specs.map(([k, v]) => (
                <div key={k}>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">{k}</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-6">
            <div className="mb-6">
              <h3 className="font-headline-md text-headline-md text-primary-container">Customer Feedback</h3>
            </div>
            <div className="space-y-6">
              {REVIEWS.map((r) => (
                <div key={r.name} className="border-t border-outline-variant/30 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt={r.name} src={r.img} />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-bold">{r.name}</p>
                      <p className="text-label-caps font-label-caps text-on-surface-variant">{r.meta}</p>
                    </div>
                  </div>
                  <p className="text-body-md text-on-surface-variant">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Configurator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="header-deep-gradient rounded-xl p-8 text-on-primary shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-white mb-1">{product.name}</h2>
                <p className="text-on-tertiary-container font-body-md">
                  {paper?.label}
                  {size ? ` · ${size.label}` : ""}
                  {side ? ` · ${side.label}` : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-end gap-2 justify-end">
                  <span className="text-4xl font-black text-secondary-container">{inr(sim.base)}</span>
                  <span className="text-on-tertiary-container font-label-caps text-sm mb-1 pb-1">/ {qty.toLocaleString("en-IN")} {product.unit}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg py-2 px-4 flex items-center gap-3 border border-white/10">
              <div className="w-2 h-2 bg-[#00c853] rounded-full pulse-dot"></div>
              <span className="text-label-caps font-label-caps tracking-wide font-bold">Live Pricing Active — price updates instantly</span>
            </div>
          </div>

          <div className="space-y-8 pb-32 lg:pb-0">
            {/* Paper / Material */}
            {product.papers && (
              <section>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">layers</span> {product.paperLabel ?? "Paper Type & Weight"}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {product.papers.map((o, i) => (
                    <button key={o.label} onClick={() => setPaperIdx(i)} className={cardCls(i === paperIdx)}>
                      <span className="font-bold text-primary-container">{o.label}</span>
                      <span className={`font-label-caps text-[10px] uppercase mt-2 ${i === paperIdx ? "text-secondary font-black" : "text-on-surface-variant font-bold"}`}>{tag(o.price)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Size */}
            {product.sizes && (
              <section>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">aspect_ratio</span> Size
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {product.sizes.map((o, i) => (
                    <button key={o.label} onClick={() => setSizeIdx(i)} className={`${pillCls(i === sizeIdx)} flex flex-col`}>
                      <span>{o.label}</span>
                      {o.price > 0 && <span className="text-[10px] font-bold text-on-surface-variant mt-0.5">+{inr(o.price)}</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Print Sides + Finishing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {product.sides && product.sides.length > 1 && (
                <section>
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">exposure</span> Print Sides
                  </h4>
                  <div className="flex gap-3">
                    {product.sides.map((o, i) => (
                      <button key={o.label} onClick={() => setSideIdx(i)} className={`flex-1 ${pillCls(i === sideIdx)}`}>
                        {o.label}{o.price > 0 ? ` (+${inr(o.price)})` : ""}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {product.finishings && (
                <section>
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">flare</span> Finishing
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.finishings.map((o, i) => (
                      <button key={o.label} onClick={() => setFinIdx(i)} className={`flex-1 min-w-[90px] ${pillCls(i === finIdx)}`}>
                        {o.label}{o.price > 0 ? ` (+${inr(o.price)})` : ""}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Quantity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">reorder</span> Quantity &amp; Bulk Pricing
                </h4>
                <span className="text-[11px] font-bold text-secondary-container px-2 py-0.5 bg-secondary-container/10 rounded">Lower unit rate at higher qty</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.qtyTiers.map((t) => (
                  <button
                    key={t.qty}
                    onClick={() => setQty(t.qty)}
                    className={qty === t.qty ? "px-4 py-2 rounded-full border-2 border-secondary-container bg-secondary-container text-white font-bold text-sm" : "px-4 py-2 rounded-full border border-outline-variant bg-white text-on-surface-variant font-bold text-sm hover:border-secondary-container/50 transition-colors"}
                  >
                    {t.qty.toLocaleString("en-IN")} · {inr(t.price)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl max-w-xs">
                <span className="text-label-caps font-bold text-on-surface-variant">Custom Qty:</span>
                <div className="flex items-center bg-white rounded-lg border border-outline-variant">
                  <button onClick={() => setQty((q) => Math.max(1, q - 50))} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">remove</span></button>
                  <input
                    className="w-16 border-none text-center font-bold text-primary-container focus:ring-0"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  />
                  <button onClick={() => setQty((q) => q + 50)} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">add</span></button>
                </div>
              </div>
            </section>

            {/* Delivery Speed */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span> Delivery Speed
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DELIVERY.map((d, i) => (
                  <button key={d.label} onClick={() => setDelIdx(i)} className={i === delIdx ? "p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left custom-shadow" : "p-4 rounded-xl border border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all"}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`material-symbols-outlined ${i === delIdx ? "text-secondary-container" : "text-on-surface-variant"}`}>{d.icon}</span>
                      <span className="font-bold text-primary-container">{d.price === 0 ? "FREE" : "+" + inr(d.price)}</span>
                    </div>
                    <p className="font-bold text-primary-container">{d.label}</p>
                    <p className="text-xs text-on-surface-variant">{d.eta}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Upload */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span> Upload Artwork
              </h4>
              <div className="border-2 border-dashed border-outline-variant bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center group hover:border-secondary-container transition-all cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <p className="font-bold text-primary-container mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-on-surface-variant mb-4">PDF, AI, PSD, PNG, JPG (Max 50MB)</p>
                <span className="bg-white/50 text-label-caps font-label-caps px-3 py-1 rounded-full text-on-surface-variant italic">Optional now, you can upload after payment</span>
              </div>
            </section>

            {/* Special Instructions */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit_note</span> Special Instructions
              </h4>
              <textarea className="w-full rounded-xl border border-outline-variant bg-white p-4 font-body-md text-on-surface focus:ring-secondary-container focus:border-secondary-container" placeholder="e.g. Any specific colour matching or finishing notes..." rows={3}></textarea>
            </section>
          </div>
        </div>

        {/* Right: Order Summary (sticky) */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 bg-surface-container-lowest rounded-xl custom-shadow p-6 border border-outline-variant/10">
            <h4 className="font-headline-md text-headline-md text-primary-container mb-6">Order Summary</h4>
            <div className="space-y-3 mb-6">
              {summaryRows.map(([k, v, c]) => (
                <div key={k} className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className={`font-bold ${c}`}>{v}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-outline-variant/30">
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Subtotal</span><span className="font-bold">{inr(sim.total)}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-8">
              <span className="font-headline-md text-headline-md text-primary-container">Total Amount</span>
              <div className="text-right">
                <span className="text-4xl font-black text-secondary">{inr(sim.total)}</span>
                <p className="text-[10px] text-on-surface-variant font-label-caps">INCL. ALL TAXES</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg flex items-center justify-between mb-2 ${enough ? "bg-tertiary-fixed" : "bg-error-container"}`}>
                <div className={`flex items-center gap-2 ${enough ? "text-on-tertiary-fixed" : "text-on-error-container"}`}>
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  <span className="font-label-caps font-bold">Wallet Balance: {inr(WALLET_BALANCE)}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${enough ? "text-[#00c853]" : "text-error"}`}>{enough ? "Enough" : "Top Up"}</span>
              </div>
              {enough ? (
                <Link href="/cart" className="w-full primary-accent-gradient text-white py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Order Now &amp; Pay with Wallet <span className="material-symbols-outlined">payments</span>
                </Link>
              ) : (
                <Link href="/wallet" className="w-full primary-accent-gradient text-white py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Top Up Wallet to Continue <span className="material-symbols-outlined">add</span>
                </Link>
              )}
              <Link href="/cart" className="w-full border-2 border-secondary text-secondary py-4 rounded-xl font-button text-button hover:bg-secondary/5 transition-all flex items-center justify-center gap-2">
                Add to Cart <span className="material-symbols-outlined">shopping_cart</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* You Might Also Like */}
      <section className="mt-20 mb-20">
        <h3 className="font-headline-lg text-headline-lg text-primary-container mb-8">You Might Also Like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
          {related.map((r) => (
            <Link key={r.slug} href={`/products/${r.slug}`} className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden group cursor-pointer block">
              <div className="h-48 bg-surface-container relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.name} src={r.image} />
              </div>
              <div className="p-5">
                <h5 className="font-bold text-primary-container mb-1">{r.name}</h5>
                <p className="text-sm text-on-surface-variant mb-4">{r.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-secondary text-lg">From {inr(r.qtyTiers[0].price)}</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

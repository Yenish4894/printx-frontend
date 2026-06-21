import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "PrintX | Premium Business Cards Configurator" };

// Pre-rendered product pages for static export
export function generateStaticParams() {
  return [{ slug: "business-cards" }, { slug: "letterheads" }];
}

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const paperTypes: [string, string, boolean][] = [
  ["Matte 350gsm", "Included", true],
  ["Glossy 350gsm", "+₹20", false],
  ["Silk Finish", "+₹50", false],
  ["Kraft Paper", "+₹30", false],
  ["Premium Linen", "+₹150", false],
];

const sizes: [string, boolean][] = [
  ["Standard", true],
  ["Square (+₹30)", false],
  ["US Letter (+₹15)", false],
  ["Custom (+₹50)", false],
];

const quantities: [string, boolean][] = [
  ["100 (₹299)", true],
  ["250 (₹549)", false],
  ["500 (₹899)", false],
  ["1000", false],
  ["2500", false],
  ["5000", false],
];

const related = [
  { name: "Premium Letterheads", sub: "A4 100gsm Bond Paper", price: "From ₹450", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCo1cOowFAIPHif2NXaaMu25SjqzYCfAiZari1poIiT4CLMWTOHSqfFu-H-TYVFHYnutOH8pWx_X4W26GXmj96pQ1NBa4DPD87PhClkGNVbiucZ2MSmiyDQRK3bK4B0FZkp58OPMIKs6ZiDSUAoQWZkbi_kHPbD2TzfDgVec5peEB9uMmMBBkr7vD9RvUf_ZLJ1fKcLsTzzGfZ6zxyuMS961LfM0xRfUpX01vc39POi0tJJk_9iTEpQa8r0tk7WKep15b68jTtX8vM" },
  { name: "Branded Envelopes", sub: "DL/C5 Sizes available", price: "From ₹120", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WYMkRGYVi2H7kHZnyn5GX7Exl8loECPn8y1zqyAK0TIh4NY4IVUXUoVPuTPyys7SgkIZboxYJV_x8YYq0j_Nwewj43fNbxdhaVU1GYuww7PngczThcr8RcTdGoQ9HOoLPIlQTkIf5jQve0U7AY8jvOgJrTX-hkBVdbErlqg6URAzFCk8Fy9Q1nmqaOBItDYklADANJuGuzh8tcMUX49SlvpYQgwanhhSDYsXLks9dBzxFHPnHgMIYS_WTMTJwi5SrHpUSArqw4o" },
  { name: "Custom Die-Cut Stickers", sub: "Waterproof Vinyl finish", price: "From ₹80", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFwzvZWQ-jnN6eedH99iYzKpq7FkInEF-DpvUOXUZdhx9e1LiiEn7MYuNyRwNEDsT4k6KsgIG5aGVvbAErFVzQzTF1TPdKE7nfpaXRh5aBnn_N6ITEdmnpHebo6zu6VffiLq9juNd8KeO5SXHVJCboGoY9xnGtizTar6Ia8iHya-Y9IPwx2KBZajVam9aNTUrXeFcWzYsP5cNH40ijCg3SyTMpTCtrPgwUnbvO2AaizCtc7gUsN7Mf-D_vjK6dqh_0cB81NS6xpys" },
];

const optionBtn = (active: boolean) =>
  active
    ? "p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left transition-all custom-shadow flex flex-col justify-between"
    : "p-4 rounded-xl border-2 border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all flex flex-col justify-between";

export default function ConfiguratorPage() {
  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 mb-4 text-on-surface-variant font-label-caps text-label-caps">
          <Link className="hover:text-secondary" href="/dashboard">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link className="hover:text-secondary" href="/products">Products</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Business Cards</span>
        </nav>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-secondary-container/10 text-secondary px-3 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-wider font-bold">Bestseller</span>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary-container text-lg" style={fill1}>star</span>
            <span className="font-bold text-on-surface">4.9</span>
            <span className="text-label-caps font-label-caps opacity-60">(312 reviews)</span>
          </div>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary-container">Premium Business Cards</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left: Showcase */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden group relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <span className="bg-secondary text-on-primary px-3 py-1 rounded-lg font-label-caps text-label-caps shadow-lg">20% OFF</span>
            </div>
            <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors shadow-sm">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <div className="aspect-[4/3] bg-surface-container relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover" alt="Premium business cards" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqo6OkW0seixYLiw8xs5ICd3Omr3RhzP75FJc-oEeVyfBjeeF0MfOgLoPJnUdMTSDFHakEIbMbVEcvbsgR0Hxv8zpTtMzbu3YcZ_FUrKz9UAwwgA-alWBxj_hl93C07I0hSwgbZa4fgaUMrD-Lv5VI9QtfX2kR6KnoopHCbrC_LxmRu0jn1unKBd6ALckxOdM-eUvSPIqsmG0eaPw12ZBIJ3zm435v8G6y6TZT5EmUVD2T99UZUrPbsDImBy7z_DJV03GdzcH1tY4" />
              <button className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:bg-white transition-all shadow-md">
                <span className="material-symbols-outlined text-lg">zoom_in</span> Zoom
              </button>
            </div>
            <div className="p-4 flex gap-4 overflow-x-auto">
              {[
                { active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOQUmP1LJYt9DNiEEAedHNubPSVihYRNTIZ7j1jXlT_vsJP8FFA9FPMmNJA1FhTYVADUmnXgsAXDDMCIjlFN5xCsOx5q4xmxEnyVrdA5klm7NyIhLlx9W1-aIoIZI2n8UVDMpA72efQ6ohBWoOscsDJ6vtbvtqazdzLe0uP_dXu3BdqhOXHyY1ofhtC1BcQjQJ0McjZZ9mzaI5PBQSw_fxYKZNBBewOC1Yj-s5-0ps4vdqE8EO-QsARWIXp4-lN69APtwhFVoCk-k" },
                { active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNinPzoMtuBXIqn2W4Wwk0WhLCDcFzSItFf4ddWdIsVYK9HXX8w3cZsdV0LdURkxvle6tm9LJCo3S2_paEh4uahIrZ5-qm3DWfmDxKSPk3h9Ze_VSmoWOiKCxErDbhb9oZ_ZkYE35i0TbQnmpV1QTqznxz7hFLjsAjNah1CTm9AAknDzE5CtzvuTjjPbVSDsP6EK7zh4eYMk_8Tpez6afa1QRveVLURp4EbmhtvmKbKK33JIBQPmnHoCD1BVW6Da9q1DNkKQhbUJo" },
                { active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIVtMgcSo-jUT5CREBouultvG0dVAtr_5qhkXE5da4eeZ6VJJH_c6cKvMiJoPM9Ra7E2MMw_qBhdzm38V52rWSaj_27genOXEyaE2cUN1MZuRAkQaUznCTsZmQsE3Jj8S3rGJRfA95xl-36PpeaQUMMomOdVDVX4debmKxONo-sevmdBl5yCQWUX8ZIfMcc1ZriMilX9JzQ9L0XXm3-OPvNL0L_WWgvPrl7XQuGKNTQO83ZzBxOI7Vj-cfefY8xNzQ6QGYUMW0vLg" },
              ].map((t, i) => (
                <div key={i} className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer ${t.active ? "border-2 border-secondary-container" : "border border-outline-variant opacity-70 hover:opacity-100 transition-opacity"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="thumbnail" src={t.img} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-6">
            <h3 className="font-headline-md text-headline-md text-primary-container mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">description</span> Product Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {[
                ["Category", "Business Stationery"],
                ["Standard Size", "85x55mm"],
                ["Print Type", "Full Color CMYK"],
                ["Min Quantity", "100 Pieces"],
                ["File Format", "PDF, AI, PSD, PNG"],
                ["Bleed Area", "3mm around"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">{k}</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline-md text-headline-md text-primary-container">Reviews</h3>
              <button className="text-secondary font-button text-button hover:underline">See all 312</button>
            </div>
            <div className="flex items-center gap-10 mb-10">
              <div className="text-center">
                <p className="text-5xl font-black text-primary-container">4.9</p>
                <div className="flex justify-center my-1 text-secondary-container">
                  {["star", "star", "star", "star", "star_half"].map((s, i) => (
                    <span key={i} className="material-symbols-outlined" style={fill1}>{s}</span>
                  ))}
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">Average Score</p>
              </div>
              <div className="flex-1 space-y-2">
                {[["5", "92%", ""], ["4", "6%", ""], ["3", "2%", "opacity-30"]].map(([n, w, op]) => (
                  <div key={n} className={`flex items-center gap-4 ${op}`}>
                    <span className="w-3 text-label-caps font-bold">{n}</span>
                    <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-container" style={{ width: w }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {[
                { name: "Sarah Jenkins", meta: "Verified Purchase • 2 days ago", text: "The quality of the 350gsm matte paper is phenomenal. The colors came out exactly as they were in my PDF. Highly recommend for any creative agency.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKhex3XSSHWqudUxu-SL_80ynkX9ZQ1sASTHZs9eYyq0uoHkxL4Biv0Oq-Zh6GkCT_1_ubNMF3kNRF_n4LDGSqLHttcC8XZkMAoY58J-iHaNJ-g8W4oQO375cLCugAtpdVvNBmcuM1HXNbO03tCDI6dCqZ4RmvYPwxV-BrxOwBiFJ5PS-X-r5aSN7KVnPDtKOp4S8o7HtRIRj0sRPIVT7-8v43kIJY1JDsCoIsIOyZD9WHZQWbHZOThaOr1GqeOKpA2Q5OyCUk5Hk" },
                { name: "Marcus Thorne", meta: "Verified Purchase • 1 week ago", text: "First time using PrintX for business cards. The Gold Foil finish is absolute luxury. The packaging was also very secure and premium.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx7_dnmSgPqhMy05DVrTyWKbUcK7kxJfkKNADKpsEmsS_kO1lb4o2iHGGKcczeXM0yJeucQCDeMv_v7zhiLjJ0VpJvSxULnK6xz142n5pshPW6UpgiRyqFhfauMMz9_4x4IVqNt_a-WVxPLddNX9pPLN5Rd6B7vYmZOil5eG7tXC0sJhz4e3kDedS2IzwucZj1fCoRNVPD496cFm4DlRNHjf5ewTg-mIeJmm18FOjNJhKI9DDAfBpNFau7NE5QryYOpkmxxj7CgU0" },
              ].map((r) => (
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
                <h2 className="font-headline-md text-headline-md text-white mb-1">Standard Business Cards</h2>
                <p className="text-on-tertiary-container font-body-md">Standard Size, Single Sided</p>
              </div>
              <div className="text-right">
                <p className="text-on-tertiary-container line-through text-lg font-medium">₹375</p>
                <div className="flex items-end gap-2 justify-end">
                  <span className="text-4xl font-black text-secondary-container">₹299</span>
                  <span className="text-on-tertiary-container font-label-caps text-sm mb-1 pb-1">/ 100 pcs</span>
                </div>
                <p className="text-[#00c853] font-bold text-sm mt-1 flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[16px]" style={fill1}>account_balance_wallet</span> Save ₹24 with wallet
                </p>
              </div>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg py-2 px-4 flex items-center gap-3 border border-white/10">
              <div className="w-2 h-2 bg-[#00c853] rounded-full pulse-dot"></div>
              <span className="text-label-caps font-label-caps tracking-wide font-bold">Live Pricing Active — price updates instantly</span>
            </div>
          </div>

          <div className="space-y-8 pb-32 lg:pb-0">
            {/* Paper Type */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">layers</span> Paper Type &amp; Weight
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paperTypes.map(([name, tag, active]) => (
                  <button key={name} className={optionBtn(active)}>
                    <span className="font-bold text-primary-container">{name}</span>
                    <span className={`font-label-caps text-[10px] uppercase mt-2 ${active ? "text-secondary font-black" : "text-on-surface-variant font-bold"}`}>{tag}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Size */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">aspect_ratio</span> Size
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sizes.map(([label, active]) => (
                  <button key={label} className={active ? "py-3 px-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-center font-bold text-primary-container" : "py-3 px-4 rounded-xl border border-outline-variant bg-white text-center font-bold text-on-surface-variant hover:border-secondary-container/50"}>{label}</button>
                ))}
              </div>
            </section>

            {/* Print Sides + Finishing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <section>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">exposure</span> Print Sides
                </h4>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-center font-bold text-primary-container">Single</button>
                  <button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-white text-center font-bold text-on-surface-variant hover:border-secondary-container/50">Double (+₹60)</button>
                </div>
              </section>
              <section>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">flare</span> Finishing
                </h4>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-center font-bold text-primary-container">None</button>
                  <button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-white text-center font-bold text-on-surface-variant hover:border-secondary-container/50">Spot UV (+₹80)</button>
                  <button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-white text-center font-bold text-on-surface-variant hover:border-secondary-container/50">Gold Foil (+₹200)</button>
                </div>
              </section>
            </div>

            {/* Quantity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">reorder</span> Quantity &amp; Bulk Pricing
                </h4>
                <span className="text-[11px] font-bold text-secondary-container px-2 py-0.5 bg-secondary-container/10 rounded">Bulk discount for 500+</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {quantities.map(([label, active]) => (
                  <button key={label} className={active ? "px-4 py-2 rounded-full border-2 border-secondary-container bg-secondary-container text-white font-bold text-sm" : "px-4 py-2 rounded-full border border-outline-variant bg-white text-on-surface-variant font-bold text-sm hover:border-secondary-container/50"}>{label}</button>
                ))}
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl max-w-xs">
                <span className="text-label-caps font-bold text-on-surface-variant">Custom Qty:</span>
                <div className="flex items-center bg-white rounded-lg border border-outline-variant">
                  <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">remove</span></button>
                  <input className="w-16 border-none text-center font-bold text-primary-container focus:ring-0" type="number" defaultValue={100} />
                  <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">add</span></button>
                </div>
              </div>
            </section>

            {/* Delivery Speed */}
            <section>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span> Delivery Speed
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 rounded-xl border-2 border-secondary-container bg-surface-container-lowest text-left custom-shadow">
                  <div className="flex justify-between items-start mb-2"><span className="material-symbols-outlined text-secondary-container">bolt</span><span className="font-bold text-primary-container">+₹99</span></div>
                  <p className="font-bold text-primary-container">Express</p><p className="text-xs text-on-surface-variant">1–2 business days</p>
                </button>
                <button className="p-4 rounded-xl border border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all">
                  <div className="flex justify-between items-start mb-2"><span className="material-symbols-outlined text-on-surface-variant">schedule</span><span className="font-bold text-primary-container">+₹49</span></div>
                  <p className="font-bold text-primary-container">Standard</p><p className="text-xs text-on-surface-variant">3–5 business days</p>
                </button>
                <button className="p-4 rounded-xl border border-outline-variant bg-white text-left hover:border-secondary-container/50 transition-all">
                  <div className="flex justify-between items-start mb-2"><span className="material-symbols-outlined text-on-surface-variant">savings</span><span className="font-bold text-primary-container">FREE</span></div>
                  <p className="font-bold text-primary-container">Economy</p><p className="text-xs text-on-surface-variant">5–7 business days</p>
                </button>
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
              <textarea className="w-full rounded-xl border border-outline-variant bg-white p-4 font-body-md text-on-surface focus:ring-secondary-container focus:border-secondary-container" placeholder="e.g. Any specific color matching or finishing notes..." rows={3}></textarea>
            </section>
          </div>
        </div>
        {/* Right: Order Summary (sticky 3rd column) */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 bg-surface-container-lowest rounded-xl custom-shadow p-6 border border-outline-variant/10">
          <h4 className="font-headline-md text-headline-md text-primary-container mb-6">Order Summary</h4>
          <div className="space-y-3 mb-6">
            {[
              ["Base Price (100 pcs)", "₹299", ""],
              ["Paper (Matte 350gsm)", "Included", "text-[#00c853]"],
              ["Finishing (None)", "Included", "text-[#00c853]"],
              ["Delivery (Express)", "₹99", ""],
            ].map(([k, v, c]) => (
              <div key={k} className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">{k}</span>
                <span className={`font-bold ${c}`}>{v}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-outline-variant/30">
              <div className="flex justify-between text-body-md mb-2"><span className="text-on-surface-variant">Subtotal</span><span className="font-bold">₹398</span></div>
              <div className="flex justify-between text-body-md text-[#00c853] font-bold"><span>Wallet discount (8%)</span><span>−₹32</span></div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="font-headline-md text-headline-md text-primary-container">Total Amount</span>
            <div className="text-right">
              <span className="text-4xl font-black text-secondary">₹366</span>
              <p className="text-[10px] text-on-surface-variant font-label-caps">INC. ALL TAXES</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-tertiary-fixed rounded-lg flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                <span className="font-label-caps font-bold">Wallet Balance: ₹2,450</span>
              </div>
              <span className="text-[10px] font-black text-[#00c853] uppercase tracking-wider">Enough</span>
            </div>
            <Link href="/cart" className="w-full primary-accent-gradient text-white py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
              Order Now &amp; Pay with Wallet <span className="material-symbols-outlined">payments</span>
            </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {related.map((r) => (
            <Link key={r.name} href="/products/letterheads" className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden group cursor-pointer block">
              <div className="h-48 bg-surface-container relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.name} src={r.img} />
              </div>
              <div className="p-5">
                <h5 className="font-bold text-primary-container mb-1">{r.name}</h5>
                <p className="text-sm text-on-surface-variant mb-4">{r.sub}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-secondary text-lg">{r.price}</span>
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

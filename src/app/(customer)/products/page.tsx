import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics | Print Catalog" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const categories: [string, string, boolean][] = [
  ["apps", "All Products", true],
  ["badge", "Business Cards", false],
  ["description", "Brochures & Flyers", false],
  ["label", "Stickers & Labels", false],
  ["flag", "Posters & Banners", false],
  ["package_2", "Packaging", false],
  ["draft", "Stationery", false],
];

type Product = {
  slug: string;
  name: string;
  desc: string;
  rating: string;
  price: string;
  badge?: { label: string; color: string };
  badgeBottom?: boolean;
  img: string;
};

const products: Product[] = [
  {
    slug: "business-cards",
    name: "Premium Business Cards",
    desc: 'Standard 3.5" x 2.0" with luxury matte finish and triple-layer cardstock.',
    rating: "4.9",
    price: "₹499.00",
    badge: { label: "Bestseller", color: "bg-secondary text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdpKD5ombdeWroMGXbdOtUZ5E6k7VpUsnSZU2z6iWVUaFsZIHH5loB-ujTdJSZPB_ybeKb8aREceYp6eKoQUVhwVbcfe3caRTzRIgA6fsmx6jsw9Cm5fKcanYofNW5LjYfDfdN3GyRzI8Aoo0VPbMK6gRE6B_zQEnvubDPOBxHcsfnsCWuAb0aJ7JXxkTEjNb7o3Z9_4S7tJMEcjFi848j8qeYBCB2YO9cwtarxNkBkJNhHib47vW8fRbbrraQNRMYiAng_THHnA",
  },
  {
    slug: "executive-stationery",
    name: "Executive Stationery",
    desc: "Bonded 120gsm paper with custom gold foil embossing for corporate identity.",
    rating: "4.7",
    price: "₹1,250.00",
    badge: { label: "Premium", color: "bg-primary text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMd-bEzzAR4c7MA4RjLyc2BathZWU54zo46QjEApb3quT5MURup6e1jkjUtZMmknRqtmujSXZyakeeOjACP5RggO56Cp6IkZAiufwa5MfWxPpVKKeWFTCURLod2bAiOPJfDdxO_6JY25Dzyar1N_dmO2RCk_1Zr99cBVQRDPl6m-XGTrT3F9LfRm6wD1JGvL0P4m_1UucGs4r7aqIFoM0eMAEif7EhQgaNJrw9CIM87xnvYrxiH13i1AsxPu2gL7C07zy3v1YaDnk",
  },
  {
    slug: "trifold-brochures",
    name: "Trifold Brochures",
    desc: "Glossy 170gsm art paper with high-fidelity color reproduction.",
    rating: "4.8",
    price: "₹8.50 / pc",
    badge: { label: "Bulk Value", color: "bg-tertiary-container text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL3F0ONaV6xSuJEQKtpJvZXkjV85aPnUS8H5KFgm3fQfJfva5yHG4DgYO9UL-J-JZZuJC3S518pQl2vkjzFKzIH-I7n-1qwTWHrqleU50srav9GyzkJpwlC37Ml5QVQ0k-3Cvq-B2pEKD2mX2E82qJb_qtMxSrOCDX6fZGlj_ltfPbAXNFjRwF_3tKhdW4kq2FyF70XtP4paLmBbH684R-8biqfPRQKt4zh-adE30PsNCbZrt3N2s82j9G2xpjV8S3fJuXgODvj_k",
  },
  {
    slug: "event-posters",
    name: "Event Posters",
    desc: "A2-A0 sizes on UV resistant synthetic paper. Perfect for indoors & outdoors.",
    rating: "4.9",
    price: "₹450.00",
    badge: { label: "New Arrival", color: "bg-secondary-container/90 backdrop-blur text-white" },
    badgeBottom: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBePVDm5i4NTZ74p79vqqYHdh6Qki45IfxUmb5I4ceoxtduj3NfxKjl5AJn3-QF5XQswhAxwEMJr_LsQfBFZHVzA1Tt16a1602jznScavCkYxPRwXBWmH2UBng9XKcisP2yPHUO0vNqJifwagSI_zzbOHZF2ok6jubuv_wwXAAAr7NQ7P6l2Wr7ZM84Oaf4YRTC6-WzVJKhowQzqs9jtQQBrckP0_-jj4AW_D4O5upkaBeJE0agziVaaYYRwLkbGoR3fGTLtY8wiBc",
  },
  {
    slug: "luxury-packaging",
    name: "Luxury Packaging",
    desc: "Custom die-cut boxes with soft-touch lamination and magnetic closures.",
    rating: "5.0",
    price: "₹85.00 / box",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwLUoeRd7oLtExsu1F8ZLoVkOsA4cRoh1q2dgF1IYBTTmdEIzAO-abwkZasFcEkF3XAm0zSxgoBl_624QPd6kGoKqtjkBP9atXp_qZOVec6d72ekC527BVWFf43OG2evZBVuCIQHsEgtX5ngJiqp0NGbnhelwS8hIhrwfZSmwc4jG9nStZi4SBtFHrcDrzkK8JNRkvS-MbMLxC3ronA_1IFljNrEIfs9FL24haSuiqaUjzAuJNWyFQeso7EHnceSa3L3he6VP_Y10",
  },
];

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="bento-card group flex flex-col bg-surface border border-outline-variant rounded-3xl overflow-hidden shadow-sm hover:shadow-xl">
      <div className="aspect-[4/3] bg-surface-container relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={p.img} />
        {p.badge && (
          <div className={`absolute ${p.badgeBottom ? "bottom-4" : "top-4"} left-4`}>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${p.badge.color}`}>{p.badge.label}</span>
          </div>
        )}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">favorite</span>
        </button>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-headline-md text-[20px]">{p.name}</h3>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{p.desc}</p>
        <div className="mt-auto pt-6 border-t border-outline-variant flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">STARTING FROM</span>
            <span className="font-price-lg text-price-lg">{p.price}</span>
          </div>
          <Link href={`/products/${p.slug}`} className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center hover:bg-secondary transition-all active:scale-90">
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductsListing() {
  return (
    <>
      {/* Sub Header / Breadcrumb & Account Context */}
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
              <p className="text-on-primary-container font-body-lg">Premium materials. Industrial precision. Zero compromises.</p>
            </div>
            <div className="flex items-center gap-4 bg-primary-container/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="flex flex-col text-right">
                <span className="font-label-caps text-on-primary-container opacity-80">ACCOUNT BALANCE</span>
                <span className="font-price-lg text-price-lg text-secondary-container">₹2,450.00</span>
              </div>
              <div className="bg-secondary-container/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-secondary-container" style={fill1}>account_balance_wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="max-w-container-max mx-auto px-gutter -mt-8 relative z-10">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(([icon, label, active]) => (
            <button key={label} className={`flex-none bg-surface border border-outline-variant px-6 py-4 rounded-xl flex items-center gap-3 hover:border-secondary transition-all group ${active ? "shadow-lg" : "shadow-sm"}`}>
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                <span className={`material-symbols-outlined ${active ? "text-secondary" : ""}`}>{icon}</span>
              </div>
              <span className="font-button text-button">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-container-max mx-auto px-gutter py-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-none space-y-8">

          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-[18px]">Filter Prints</h4>
              <button className="text-secondary font-label-caps hover:underline">RESET</button>
            </div>
            <div className="space-y-6">
              <div className="relative">
                <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-secondary" placeholder="Search category..." type="text" />
                <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant text-sm">search</span>
              </div>
              <div className="space-y-3">
                <span className="font-label-caps text-on-surface-variant">MATERIAL CATEGORY</span>
                <div className="space-y-2">
                  {[["Premium Matte", "24", true], ["High Gloss", "18", false], ["Recycled Craft", "12", false]].map(([label, count, checked]) => (
                    <label key={label as string} className="flex items-center gap-3 cursor-pointer group">
                      <input defaultChecked={checked as boolean} className="w-4 h-4 accent-secondary" type="checkbox" />
                      <span className="text-body-md group-hover:text-secondary transition-colors">{label as string}</span>
                      <span className="ml-auto text-xs text-on-surface-variant font-mono">{count as string}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="h-[1px] bg-outline-variant"></div>
              <div className="space-y-3">
                <span className="font-label-caps text-on-surface-variant">FINISHING TOUCH</span>
                <div className="flex flex-wrap gap-2">
                  {[["Spot UV", false], ["Gold Foil", false], ["Embossed", true], ["Soft Touch", false]].map(([label, on]) => (
                    <button key={label as string} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${on ? "bg-secondary text-white" : "bg-surface border border-outline-variant hover:border-secondary"}`}>{label as string}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-tertiary-container text-on-tertiary p-6 rounded-2xl flex items-start gap-4 shadow-sm">
            <span className="material-symbols-outlined text-secondary-container">help</span>
            <div>
              <h5 className="font-button text-white mb-1">Need specialized help?</h5>
              <p className="text-xs text-on-tertiary-container leading-relaxed mb-3">Our print experts are online to assist with custom configurations.</p>
              <a className="text-xs font-bold text-secondary-container hover:underline uppercase tracking-wider" href="tel:+917203000701">Call an Expert</a>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant font-label-caps">SORT BY:</span>
              <select className="bg-transparent font-button text-sm focus:outline-none cursor-pointer text-secondary">
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Delivery Speed</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-primary-container text-white px-3 py-1.5 rounded-lg items-center gap-2">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-[11px] font-bold uppercase tracking-widest">Express Delivery Available</span>
              </div>
              <div className="flex border border-outline-variant rounded-lg overflow-hidden">
                <button className="p-2 bg-surface-container-high border-r border-outline-variant text-secondary"><span className="material-symbols-outlined text-[20px]">grid_view</span></button>
                <button className="p-2 hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[20px] text-on-surface-variant">view_list</span></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            <ProductCard p={products[0]} />
            <ProductCard p={products[1]} />
            {/* Custom Configuration CTA card */}
            <div className="flex flex-col bg-surface-container-high rounded-3xl p-8 border-2 border-dashed border-outline-variant relative overflow-hidden justify-center items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[40px] text-secondary">add_circle</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Custom Configuration</h3>
              <p className="text-on-surface-variant text-sm mb-8 max-w-[200px]">Don&apos;t see what you need? Build a custom job from scratch.</p>
              <button className="border-2 border-secondary text-secondary font-button text-button px-8 py-3 rounded-full hover:bg-secondary hover:text-white transition-all">Start Project</button>
            </div>
            <ProductCard p={products[2]} />
            <ProductCard p={products[3]} />
            <ProductCard p={products[4]} />
          </div>

          <div className="flex flex-col items-center gap-6 py-12">
            <div className="text-center">
              <p className="text-on-surface-variant text-sm mb-4">Showing <span className="font-bold text-on-surface">6</span> of <span className="font-bold text-on-surface">48</span> premium printing products</p>
              <div className="w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-1/8 h-full primary-gradient"></div>
              </div>
            </div>
            <button className="bg-surface border-2 border-outline-variant font-button text-button px-10 py-3 rounded-xl hover:border-secondary hover:text-secondary transition-all flex items-center gap-2">
              Load More Services <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link href="/products/business-cards" className="fixed bottom-8 right-8 primary-gradient text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined" style={fill1}>add_photo_alternate</span>
        <span className="font-button text-button">Upload Design</span>
      </Link>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "PrintX Admin | Products" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const products = [
  { name: "Business Cards", sku: "PC-BC-001", badge: { label: "Best Seller", color: "bg-secondary-container/10 text-secondary-container" }, category: "Stationery", pricing: "Tiered", from: "₹1,450", rating: "4.9", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyFuzOFei4RSupRp-Y_aAUF0qn7hnWzPUYnu3YwbV7qezvsnE4L5Tl28FkW_LL03MY-6g2vEJxphsnU-su7knpcB4We-DpOThBIqFQBtjorP3WS4yIYu4ncRt6j6j9WU9SDMArBbQqjauxOES_o8NNQt6kQ7b-WJDJrSiZveHQWTIkkfJzQGw-8mS7_0tYnJwA9rDW6hg_7CAHJwAJxWLoNGorJy6-Y6z-T0z0uBitJobAHd6ejvDqcz_I6rI4qV2D8K7u7YWt6qo" },
  { name: "Trifold Brochures", sku: "PC-TB-012", category: "Marketing", pricing: "Per-unit", from: "₹1,251", rating: "4.7", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKVHOJFrswE6SVd8f3dseqDrPsWwkgMyY_Sw1da76R8tr4NEBA5AysPxmatLjhkefRO4zTNxj0zfZFdGdGXc58zulR9ZqOXeFjnS7WUOPYsodTMmSFnCnEED10L14Wf-BWcb5xnHo2nv66AnpTCiiLGjnO88P4TSFRcpFchAOzvX9loqy-SEJKp56E2FEfdlj9-y0VHUCCp2IvNFHCZtbn7YUmACUGBtyJxifhhF9wUdOullYimGAA2hFpFwaq6hyaZfqd_c3DQgo" },
  { name: "A4 Flyers", sku: "PC-FL-045", badge: { label: "New", color: "bg-blue-100 text-blue-700" }, category: "Marketing", pricing: "Tiered", from: "₹600", rating: "4.8", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhrW1Lo4LYMH0n4nvEbQK5cei2TtnvrhOZsHUNfCALn9wx1kCG8qWGk2dkNug4Bo9FECFINbTQvco-mkDZ4JbN8qpYlZ_u6J_kdwXmLd133V3uCGItD8M7BJ6vy_DtWHmllNjB7_tslrtj61U3y5MhHk56_n2uFgD0gySHqqjjd8u5FWo4xj8WT8_vkYZqkExgmvO9Lifd9z_wUB0s4frX6bMMNSykzarXGAtKPgagpLjop08xdfju-GUtq8GvV4IpFLR7CQd-t3U" },
  { name: "Custom Packaging", sku: "PC-PK-088", category: "Packaging", pricing: "Per-unit", from: "₹2,139", rating: "4.6", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYJ0bT5WrrZBhP3d7RbWVrXpv7tXk8Vcdl4b0PGiMRdFX_5QNy_G-mpSd0F9Hm-yw2ecz9xw3YPneomLqTxxFJQiclDU1lVqhAIZo0_egDsil5jVUr1gtwDWtNFe1zkq4R7Acgk7cApiBCbUV_zhRxPZyTFatC6gSPrZN2i32zTXEzbZxFoLFBzHKU0wzfW36M53YdNyp5msCMYTo21KBdhPXtGL6aZ2deQKubQ9F5uS-JHKBfD5JW4l8dPgehWefd9w5XY5i8BkE" },
  { name: "Letterheads", sku: "PC-LH-022", category: "Stationery", pricing: "Tiered", from: "₹1,100", rating: "4.5", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8GiJP1BybfJ0R1vUCM_jB-WOqlMT-UXkcVC0Box7kaK5nYIjglQoA1Y5oxk8Z8pi-mXQt0ahUu26TnYO-WYLMKa9tD_807U7GdaG4iVsjEERdAWHWxeXPYJNWQoFOj1aydX7LnTv7YOrz8D7-IrM4GMtrD01TR01w5fjyb0RTnpSsYMhTVe2KA56aTF-wpbdMfgHrOZq3MGHFs3ff-BFGH-SNF0uC0z2yGLZV-l9SDRkcgbdVjFtUKEbNer0KO-NlyW3XDw9WF-M" },
];

const Toggle = () => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input defaultChecked className="sr-only peer" type="checkbox" />
    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
  </label>
);

const stats: [string, string, string, string][] = [
  ["Inventory Value", "₹8.4L", "+12% from last month", "inventory"],
  ["Total Units Sold", "14.2k", "+5.2% vs target", "shopping_bag"],
  ["Catalog Coverage", "92%", "+3 new SKUs", "category"],
];

export default function AdminProducts() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Products</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">24 Total products in catalog</p>
        </div>
        <Link href="/admin/products/new" className="primary-accent-gradient text-white flex items-center gap-2 px-6 py-3 rounded-xl font-button text-button shadow-lg shadow-secondary/20 hover:-translate-y-0.5 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span> Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-outline-variant/50 rounded-lg text-body-md font-medium text-on-surface hover:border-secondary transition-colors cursor-pointer">
            <option>All Categories</option><option>Marketing Materials</option><option>Stationery</option><option>Packaging</option>
          </select>
          <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-outline-variant/50 rounded-lg text-body-md font-medium text-on-surface hover:border-secondary transition-colors cursor-pointer">
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-primary font-medium transition-colors"><span className="material-symbols-outlined text-[20px]">filter_list</span> More Filters</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label-caps text-on-surface-variant">View:</span>
          <button className="p-2 text-secondary bg-secondary/10 rounded-lg"><span className="material-symbols-outlined text-[20px]">view_list</span></button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined text-[20px]">grid_view</span></button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl premium-shadow overflow-hidden border border-surface-container-highest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-highest">
                <th className="p-6 w-12"><input className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></th>
                {["Product Info", "Category", "Pricing", "Starting From", "Rating", "Status", ""].map((h, i) => (
                  <th key={i} className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {products.map((p) => (
                <tr key={p.sku} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-6"><input className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex-shrink-0 overflow-hidden border border-outline-variant/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover" alt={p.name} src={p.img} />
                      </div>
                      <div>
                        <div className="font-body-md font-bold text-primary flex items-center gap-2">
                          {p.name}
                          {p.badge && <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-tighter ${p.badge.color}`}>{p.badge.label}</span>}
                        </div>
                        <div className="text-label-caps text-on-surface-variant font-medium">SKU: {p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-body-md text-on-surface">{p.category}</td>
                  <td className="py-4 px-6"><span className="px-3 py-1 bg-surface-container-highest rounded-full text-label-caps font-bold text-on-surface-variant">{p.pricing}</span></td>
                  <td className="py-4 px-6 font-price-lg text-[18px] text-primary">{p.from}</td>
                  <td className="py-4 px-6"><div className="flex items-center gap-1 text-secondary"><span className="material-symbols-outlined text-[18px]" style={fill1}>star</span><span className="font-body-md font-bold">{p.rating}</span></div></td>
                  <td className="py-4 px-6"><Toggle /></td>
                  <td className="py-4 px-6 text-right"><Link href="/admin/products/new" className="inline-block p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant"><span className="material-symbols-outlined">more_vert</span></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low border-t border-surface-container-highest">
          <div className="text-body-md text-on-surface-variant font-medium">Showing <span className="text-primary font-bold">1-10</span> of <span className="text-primary font-bold">24</span> products</div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-outline-variant/30 rounded-lg text-body-md font-semibold text-on-surface-variant hover:border-secondary hover:text-secondary transition-all">Previous</button>
            <div className="flex gap-1">
              <button className="w-10 h-10 rounded-lg bg-secondary text-white font-bold">1</button>
              <button className="w-10 h-10 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant font-medium hover:bg-surface-container transition-all">2</button>
              <button className="w-10 h-10 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant font-medium hover:bg-surface-container transition-all">3</button>
            </div>
            <button className="px-4 py-2 bg-white border border-outline-variant/30 rounded-lg text-body-md font-semibold text-on-surface-variant hover:border-secondary hover:text-secondary transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Mini analytics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(([label, value, delta, icon]) => (
          <div key={label} className="header-deep-gradient p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-on-primary-container/80 font-label-caps text-label-caps uppercase mb-2">{label}</div>
              <div className="text-white font-price-lg text-display-lg leading-none">{value}</div>
              <div className="flex items-center gap-1 text-green-400 text-label-caps mt-4"><span className="material-symbols-outlined text-[14px]">trending_up</span> {delta}</div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10"><span className="material-symbols-outlined text-[120px]">{icon}</span></div>
          </div>
        ))}
      </div>
    </>
  );
}

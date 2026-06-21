"use client";

import { useState } from "react";

type Coupon = {
  code: string; type: string; value: string; minOrder: string; used: number; limit: number;
  pct: number; expiry: string; expired?: boolean; featured: boolean; active: boolean;
};

const coupons: Coupon[] = [
  { code: "WELCOME50", type: "Percent", value: "50%", minOrder: "₹500", used: 425, limit: 500, pct: 85, expiry: "31 Oct 2024", featured: false, active: true },
  { code: "PRINTFEST", type: "Flat", value: "₹200", minOrder: "₹1,000", used: 320, limit: 1000, pct: 32, expiry: "15 Nov 2024", featured: true, active: true },
  { code: "SAVE20", type: "Percent", value: "20%", minOrder: "₹800", used: 500, limit: 500, pct: 100, expiry: "Expired", expired: true, featured: false, active: false },
];

const stats: [string, string, string][] = [
  ["Active Coupons", "18", "Live across storefront"],
  ["Total Redemptions", "1,245", "+8% this month"],
  ["Flash Banners", "3", "Currently showing on storefront"],
];

const ToggleSm = ({ on = false }: { on?: boolean }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input defaultChecked={on} className="sr-only peer" type="checkbox" />
    <div className="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
  </label>
);

const input = "w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-secondary-container focus:ring-0 rounded-xl text-sm transition-all";

export default function AdminCoupons() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Coupons &amp; Promotions</h1>
          <p className="font-body-md text-on-surface-variant">42 total coupons</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="primary-accent-gradient text-white px-6 py-3 rounded-xl font-button shadow-lg shadow-secondary/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all"><span className="material-symbols-outlined">add</span> Create Coupon</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">{label}</p>
            <h3 className="font-headline-lg text-headline-lg font-extrabold text-primary">{value}</h3>
            <div className="text-xs text-on-surface-variant/60 font-medium mt-2">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between gap-4 items-center bg-surface-container-lowest">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary-container/50" placeholder="Search code or type..." type="text" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-sm flex items-center gap-2 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-sm">filter_list</span> Filter</button>
            <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-sm flex items-center gap-2 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-sm">download</span> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>{["Coupon Code", "Type", "Value", "Min Order", "Usage (Limit)", "Expiry", "Featured", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-4"><span className="font-bold font-body-md text-secondary">{c.code}</span></td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-surface-container text-xs font-bold rounded">{c.type}</span></td>
                  <td className="px-6 py-4 font-bold">{c.value}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.minOrder}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-surface-container h-1.5 rounded-full mb-1"><div className="bg-secondary-container h-full rounded-full" style={{ width: `${c.pct}%` }}></div></div>
                    <span className="text-[10px] font-bold">{c.used} / {c.limit}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${c.expired ? "text-error font-bold" : "text-on-surface-variant"}`}>{c.expiry}</td>
                  <td className="px-6 py-4"><ToggleSm on={c.featured} /></td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${c.active ? "text-green-600" : "text-on-surface-variant/40"}`}>
                      <span className={`w-2 h-2 rounded-full ${c.active ? "bg-green-600" : "bg-on-surface-variant/40"}`}></span> {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button className="p-1.5 hover:bg-error-container/20 rounded text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center text-sm font-medium text-on-surface-variant">
          <span>Showing 1-10 of 42 coupons</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-base">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-on-primary">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-base">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Create Coupon slide-over */}
      {modalOpen && (
        <div className="fixed inset-0 bg-primary-container/60 backdrop-blur-sm z-[100] flex justify-end" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-xl bg-white h-screen overflow-y-auto custom-scrollbar shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center sticky top-0 bg-white z-10">
              <div><h3 className="font-headline-md text-headline-md text-primary">Create New Coupon</h3><p className="text-on-surface-variant text-sm">Configure your promotion details and scope.</p></div>
              <button className="p-2 hover:bg-surface-container-low rounded-full" onClick={() => setModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-2">Core Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs font-bold mb-1 uppercase opacity-60">Coupon Code</label><input className={`${input} font-bold uppercase`} placeholder="e.g. FLASH20" type="text" /></div>
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Type</label><select className={input}><option>Percentage (%)</option><option>Fixed Amount (₹)</option></select></div>
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Value</label><input className={input} placeholder="20" type="number" /></div>
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Min Order Value</label><input className={input} placeholder="₹500" type="number" /></div>
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Max Discount</label><input className={input} placeholder="₹2000" type="number" /></div>
                </div>
              </section>
              <section className="space-y-4">
                <h4 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-2">Validity &amp; Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Start Date</label><input className={input} type="date" /></div>
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">End Date</label><input className={input} type="date" /></div>
                  <div className="col-span-2"><label className="block text-xs font-bold mb-1 uppercase opacity-60">Usage Limit (Global)</label><input className={input} placeholder="e.g. 500" type="number" /></div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold mb-1 uppercase opacity-60">Applicable Scope</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-secondary text-on-primary rounded-lg text-xs font-bold">All Products</button>
                      <button className="flex-1 py-2 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-colors">Categories</button>
                      <button className="flex-1 py-2 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-colors">Specific SKU</button>
                    </div>
                  </div>
                </div>
              </section>
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <h4 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Marketing Features</h4>
                  <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">Flash Sale Mode</span><ToggleSm on /></div>
                </div>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold mb-1 uppercase opacity-60">Flash Banner Text</label><input className={input} defaultValue="Flash Sale: 20% off all Business Cards today!" type="text" /></div>
                  <div>
                    <label className="block text-xs font-bold mb-3 uppercase opacity-60">Storefront Live Preview</label>
                    <div className="header-deep-gradient rounded-xl p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary-container">bolt</span><span className="font-bold text-sm">Flash Sale: 20% off all Business Cards today!</span></div>
                      <button className="primary-accent-gradient px-4 py-1.5 rounded-lg text-xs font-bold">Shop Now</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="p-8 border-t border-outline-variant/20 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl primary-accent-gradient text-white font-button shadow-lg shadow-secondary/20">Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

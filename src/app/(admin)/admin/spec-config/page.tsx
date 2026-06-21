"use client";

import { useMemo, useState } from "react";

type Tier = { id: number; qty: number; price: number; label: string; active: boolean };
type AddOnType = "Included" | "Flat" | "Per-unit";
type Opt = { id: number; name: string; desc: string; type: AddOnType; value: number; def: boolean };
type Delivery = { id: number; name: string; fee: number };

const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let _id = 100;
const nid = () => ++_id;

export default function SpecConfiguration() {
  const [tiers, setTiers] = useState<Tier[]>([
    { id: 1, qty: 100, price: 499, label: "Startup Pack", active: true },
    { id: 2, qty: 500, price: 1899, label: "Business Standard", active: true },
  ]);
  const [options, setOptions] = useState<Opt[]>([
    { id: 11, name: "300 GSM Matte", desc: "Smooth, premium non-reflective finish", type: "Included", value: 0, def: true },
    { id: 12, name: "350 GSM Silk", desc: "Slight sheen, extra rigid cardstock", type: "Per-unit", value: 0.8, def: false },
  ]);
  const delivery: Delivery[] = [
    { id: 1, name: "Standard Delivery (Free)", fee: 0 },
    { id: 2, name: "Express (1–2 days)", fee: 149 },
  ];

  // Simulator selections
  const [simQtyId, setSimQtyId] = useState(2);
  const [simOptId, setSimOptId] = useState(12);
  const [simDelId, setSimDelId] = useState(1);

  const sim = useMemo(() => {
    const tier = tiers.find((t) => t.id === simQtyId) ?? tiers[0];
    const opt = options.find((o) => o.id === simOptId) ?? options[0];
    const del = delivery.find((d) => d.id === simDelId) ?? delivery[0];
    const units = tier?.qty ?? 0;
    const base = tier?.price ?? 0;
    const addon = !opt ? 0 : opt.type === "Per-unit" ? opt.value * units : opt.type === "Flat" ? opt.value : 0;
    const total = base + addon + (del?.fee ?? 0);
    return { tier, opt, del, units, base, addon, deliveryFee: del?.fee ?? 0, total, wallet: total * 0.08 };
  }, [tiers, options, simQtyId, simOptId, simDelId]);

  const updTier = (id: number, patch: Partial<Tier>) => setTiers((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const updOpt = (id: number, patch: Partial<Opt>) => setOptions((p) => p.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <>
      {/* Product selector header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant font-medium">Editing:</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg font-semibold text-primary hover:border-secondary-container transition-colors">
            Business Cards <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
        <div className="md:ml-auto flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-secondary-container">sync</span>
          <span className="text-[12px] font-bold uppercase tracking-tight">Changes Auto-Saved</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Canvas */}
        <div className="flex-1 min-w-0 space-y-8 pb-12">
          {/* Base pricing */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary">payments</span><h2 className="font-headline-md text-[20px]">Base Pricing</h2></div>
              <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded-full uppercase">Tiered Model</span>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-caps border-b border-outline-variant">
                      <th className="pb-3 px-2">Quantity</th><th className="pb-3 px-2">Base Price (₹)</th><th className="pb-3 px-2">Frontend Label</th><th className="pb-3 px-2">Active</th><th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {tiers.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-4 px-2"><input className="w-20 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-secondary-container" type="number" value={t.qty} onChange={(e) => updTier(t.id, { qty: Number(e.target.value) })} /></td>
                        <td className="py-4 px-2"><input className="w-24 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-secondary-container" type="number" value={t.price} onChange={(e) => updTier(t.id, { price: Number(e.target.value) })} /></td>
                        <td className="py-4 px-2"><input className="border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-secondary-container" type="text" value={t.label} onChange={(e) => updTier(t.id, { label: e.target.value })} /></td>
                        <td className="py-4 px-2">
                          <button onClick={() => updTier(t.id, { active: !t.active })} className={`w-10 h-5 rounded-full relative transition-colors ${t.active ? "bg-secondary-container" : "bg-outline-variant"}`}>
                            <span className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${t.active ? "right-1" : "left-1"}`}></span>
                          </button>
                        </td>
                        <td className="py-4 px-2 text-right"><button onClick={() => setTiers((p) => p.filter((x) => x.id !== t.id))} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setTiers((p) => [...p, { id: nid(), qty: 1000, price: 0, label: "New Tier", active: true }])} className="mt-6 flex items-center gap-2 text-secondary font-bold text-sm hover:translate-x-1 transition-transform"><span className="material-symbols-outlined">add_circle</span> Add Tier</button>
              <p className="mt-4 text-[12px] text-on-surface-variant italic border-t border-outline-variant pt-4 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">info</span> Note: Per-Unit products (e.g. Banners) instead show a unit rate and unit type (sq. ft / meter).</p>
            </div>
          </section>

          {/* Spec groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary">layers</span><h2 className="font-headline-md text-[20px]">Specification Groups</h2></div>
              <button className="text-label-caps text-secondary-container underline">Reorder Groups</button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl premium-shadow border border-outline-variant/30">
              <div className="p-4 flex flex-wrap items-center gap-4 bg-surface-container-low rounded-t-xl">
                <span className="material-symbols-outlined text-on-surface-variant cursor-grab">drag_indicator</span>
                <div className="flex-1 flex items-center gap-3">
                  <input className="font-bold text-on-surface border-none bg-transparent focus:ring-0 w-48" type="text" defaultValue="Paper Quality" />
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary cursor-pointer">edit</span>
                </div>
                <div className="flex items-center gap-4 text-label-caps text-on-surface-variant">
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-outline-variant/50"><span>Selection:</span><select className="border-none p-0 text-[11px] font-bold uppercase bg-transparent focus:ring-0"><option>Single</option><option>Multi</option></select></div>
                  <label className="flex items-center gap-2 cursor-pointer"><input defaultChecked className="rounded text-secondary focus:ring-secondary" type="checkbox" /> Required</label>
                  <button className="p-1 hover:bg-surface-container-highest rounded transition-colors"><span className="material-symbols-outlined text-[20px]">palette</span></button>
                  <button className="p-1 text-error/70 hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  <span className="material-symbols-outlined">expand_less</span>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-caps text-on-surface-variant/70 border-b border-outline-variant">
                      <th className="pb-2 font-bold">Option Name</th><th className="pb-2 font-bold">Add-on Type</th><th className="pb-2 font-bold">Value (₹)</th><th className="pb-2 font-bold">Default</th><th className="pb-2 font-bold text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {options.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3"><div className="font-bold text-on-surface">{o.name}</div><div className="text-[11px] text-on-surface-variant">{o.desc}</div></td>
                        <td className="py-3">
                          <select value={o.type} onChange={(e) => updOpt(o.id, { type: e.target.value as AddOnType })} className="border-none bg-surface-container-low rounded-lg text-sm focus:ring-2 focus:ring-secondary-container">
                            <option>Included</option><option>Flat</option><option>Per-unit</option>
                          </select>
                        </td>
                        <td className="py-3"><input className={`w-20 border-none bg-surface-container-low rounded-lg text-sm ${o.type === "Included" ? "opacity-50" : "focus:ring-2 focus:ring-secondary-container"}`} disabled={o.type === "Included"} type="number" value={o.value} onChange={(e) => updOpt(o.id, { value: Number(e.target.value) })} /></td>
                        <td className="py-3"><input checked={o.def} onChange={() => setOptions((p) => p.map((x) => ({ ...x, def: x.id === o.id })))} className="text-secondary-container focus:ring-secondary-container" name="paper-def" type="radio" /></td>
                        <td className="py-3 text-right"><button onClick={() => setOptions((p) => p.filter((x) => x.id !== o.id))} className="material-symbols-outlined text-on-surface-variant/40 hover:text-error cursor-pointer">close</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setOptions((p) => [...p, { id: nid(), name: "New Option", desc: "Describe this option", type: "Flat", value: 50, def: false }])} className="mt-4 text-[13px] font-bold text-secondary-container flex items-center gap-1 hover:gap-2 transition-all"><span className="material-symbols-outlined text-[18px]">add</span> Add Option</button>
              </div>
            </div>

            <button className="w-full py-4 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-on-surface-variant font-bold hover:bg-surface-container-low hover:border-secondary-container transition-all"><span className="material-symbols-outlined">add_box</span> Add Spec Group</button>
          </div>

          {/* Delivery speeds */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2"><span className="material-symbols-outlined text-secondary">local_shipping</span><h2 className="font-headline-md text-[20px]">Delivery Speeds</h2></div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-label-caps text-on-surface-variant/70 border-b border-outline-variant text-left"><th className="pb-2">Name</th><th className="pb-2">Fee (₹)</th><th className="pb-2">ETA (Days)</th><th className="pb-2 text-right">Delete</th></tr></thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="py-4"><input className="border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-secondary-container" type="text" defaultValue="Standard" /></td>
                    <td className="py-4"><input className="w-20 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-secondary-container" type="number" defaultValue={0} /></td>
                    <td className="py-4"><div className="flex items-center gap-2"><input className="w-16 border-none bg-surface-container-low rounded-lg text-sm" type="number" defaultValue={5} /><span>to</span><input className="w-16 border-none bg-surface-container-low rounded-lg text-sm" type="number" defaultValue={7} /></div></td>
                    <td className="py-4 text-right"><span className="material-symbols-outlined text-on-surface-variant/40 hover:text-error cursor-pointer">delete</span></td>
                  </tr>
                </tbody>
              </table>
              <button className="mt-4 flex items-center gap-1 text-secondary font-bold text-sm"><span className="material-symbols-outlined text-[18px]">add_circle</span> Add Delivery Mode</button>
            </div>
          </section>

          {/* Conditional rules */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2"><span className="material-symbols-outlined text-secondary">rule</span><h2 className="font-headline-md text-[20px]">Conditional Logic Rules</h2></div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                <span className="text-sm font-bold text-on-surface-variant uppercase">Rule 1:</span>
                <span className="text-sm">Show</span>
                <select className="border-none bg-white rounded shadow-sm text-sm font-bold"><option>Lamination Group</option></select>
                <span className="text-sm">when</span>
                <select className="border-none bg-white rounded shadow-sm text-sm font-bold"><option>Paper Quality</option></select>
                <select className="border-none bg-white rounded shadow-sm text-sm font-bold"><option>is</option></select>
                <select className="border-none bg-white rounded shadow-sm text-sm font-bold"><option>350 GSM Silk</option></select>
                <button className="ml-auto text-error/60"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 border border-secondary text-secondary rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-secondary/5 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> Add Condition</button>
                <button className="px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-secondary/20 active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">playlist_add</span> New Rule</button>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky simulator (LIVE) */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-primary-container text-white rounded-2xl shadow-xl p-6 overflow-hidden relative border border-white/10">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-2 mb-6"><span className="material-symbols-outlined text-secondary-container">model_training</span><h3 className="font-bold text-sm uppercase tracking-widest text-on-tertiary-container">Live Simulator</h3></div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] text-white/50 font-bold uppercase block mb-1">Quantity</label>
                  <select value={simQtyId} onChange={(e) => setSimQtyId(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-secondary-container p-2">
                    {tiers.filter((t) => t.active).map((t) => <option key={t.id} value={t.id} className="text-on-surface">{t.qty} Units</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/50 font-bold uppercase block mb-1">Paper Quality</label>
                  <select value={simOptId} onChange={(e) => setSimOptId(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white p-2">
                    {options.map((o) => <option key={o.id} value={o.id} className="text-on-surface">{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/50 font-bold uppercase block mb-1">Delivery Speed</label>
                  <select value={simDelId} onChange={(e) => setSimDelId(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white p-2">
                    {delivery.map((d) => <option key={d.id} value={d.id} className="text-on-surface">{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-white/70"><span>Base Price ({sim.units})</span><span>{inr(sim.base)}</span></div>
                {sim.addon > 0 && (
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Paper Add-on{sim.opt?.type === "Per-unit" ? ` (${sim.units} × ${sim.opt.value})` : ""}</span>
                    <span>+ {inr(sim.addon)}</span>
                  </div>
                )}
                {sim.deliveryFee > 0 && <div className="flex justify-between text-xs text-white/70"><span>Delivery</span><span>+ {inr(sim.deliveryFee)}</span></div>}
                <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-white/5"><span>Total Price</span><span className="text-secondary-container">{inr(sim.total)}</span></div>
              </div>
              <div className="mt-6 p-4 bg-tertiary-container/80 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/60 mb-2"><span className="material-symbols-outlined text-[14px]">account_balance_wallet</span> Wallet Preview (8% Cashback)</div>
                <div className="text-xl font-extrabold text-white">{inr(sim.wallet)}</div>
                <div className="text-[10px] text-secondary-container font-bold uppercase mt-1">Available for next order</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/30 text-center">
              <button className="w-full py-4 primary-accent-gradient text-white font-extrabold text-lg rounded-xl shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all mb-4">Save All Changes</button>
              <div className="flex items-center justify-center gap-2 text-on-surface-variant px-2">
                <span className="material-symbols-outlined text-[16px] text-error">campaign</span>
                <p className="text-[11px] font-medium leading-tight text-left"><span className="font-bold text-on-surface">Immediate Deployment:</span> Changes reflect instantly for customers.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

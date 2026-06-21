"use client";

import { useState } from "react";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

type Customer = {
  name: string; joined: string; email: string; phone: string; wallet: string;
  tier: string; tierColor: string; orders: number; spent: string; active: boolean; img: string;
};

const customers: Customer[] = [
  { name: "Meera Kapoor", joined: "Joined 12 Oct 2023", email: "meera.k@example.com", phone: "+91 98765 43210", wallet: "₹450.00", tier: "Platinum", tierColor: "bg-indigo-100 text-indigo-700", orders: 42, spent: "₹1,24,500", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdY0_j-q9ojE5SsoLA66mt-SBAh_KMP4ZZaIm1-GCsOpE0jFFEa9aybBFRtk3rddJkB9XcYYSNHiGejukbUBPpANUzFxmegXYKPgSZO2_gVn4JE589Gyeb9YBPHWU0r2fyIt1SsdKTah4zmNCCUCmTuR0I-0EYVukQ4k-84Q2scTRlotuQizFRCyaDiONu_-sLXhqc-wEOloMEDlxOFqO4wCbMwqmVsLdqueI-GeWJfGRsizzIc_ns7T_vBlYZuK-PllKbfHOrtF8" },
  { name: "Arjun Singh", joined: "Joined 05 Nov 2023", email: "arjun.s@corp.in", phone: "+91 99887 76655", wallet: "₹12.00", tier: "Gold", tierColor: "bg-amber-100 text-amber-700", orders: 15, spent: "₹48,200", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlkQ8v6z5LEbTNWY-GjYPyuuok8eBkI2282whT2X3R9iO8cS9R8_j12-S_RCAfOKu0FtiVy9GJgc9tdobrrOwESOLfK1TplRs8dCRHh5J9UIVUHFZb8OgMQKVXc8kyE0H6Sbci73igW0VNTthpf4LHD657jBO9fZXSsBMQbip37D6Vbe0z6WPmL727z4JbUZHjfF-QCFLhdNH4qJj-eKq9KbqE_9CCbg-kU2gYb1Sj_0KdbOkWODDP1Ie0sRoqpUBwHrpC8nMlnus" },
  { name: "Sarah Khan", joined: "Joined 28 Jan 2024", email: "sarah.k@design.com", phone: "+91 77665 54433", wallet: "₹0.00", tier: "Silver", tierColor: "bg-slate-100 text-slate-700", orders: 2, spent: "₹4,500", active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAONOFbmGraHmi5lE8FOlCCWRqOOWQUhowIsIkVFkvv8fE6qMKkVun9IzGuWnABWYNXSX0DVJ83W3ZSeOya8anarXEjEIECDp0rXnkJOf_OY3MCAUEZBeLmv27RltFuviAFV6pM-NU_kLeMiXGkLUsPd5dBc_f3_MOlaLOfNC1zjR0Yakeb99rTEl5cWjvkeoXJySA51y6Df1geoUxPney3pK2Jk5CiFK8DEhwwtifes2ewcdrj4dpRMP_6HcNHOkC6yHcen7KTGpQ" },
];

export default function AdminCustomers() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = customers[0];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Customers</h1>
          <p className="font-body-md text-on-surface-variant">1,482 registered customers</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-on-surface-variant">Sort By</label>
            <select className="bg-surface-container border-none rounded-lg text-body-md py-2 px-4 focus:ring-2 focus:ring-secondary/20 min-w-[160px]"><option>Total Spent</option><option>Total Orders</option><option>Recently Joined</option></select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-on-surface-variant">Reward Tier</label>
            <div className="flex bg-surface-container p-1 rounded-lg">
              {["All", "Silver", "Gold", "Platinum"].map((t, i) => (
                <button key={t} className={`px-4 py-1.5 rounded-md text-xs font-bold ${i === 0 ? "bg-white shadow-sm text-secondary" : "text-on-surface-variant hover:bg-white/50"}`}>{t}</button>
              ))}
            </div>
          </div>
          <button className="p-2.5 bg-surface-container rounded-lg hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                {["Customer", "Contact Details", "Wallet Balance", "Tier", "Orders", "Total Spent", "Status", ""].map((h, i) => (
                  <th key={i} className={`px-6 py-4 font-label-caps text-on-surface-variant ${h === "Total Spent" ? "text-right" : ""} ${h === "Status" ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {customers.map((c, idx) => (
                <tr key={c.name} className={`hover:bg-surface-container-low transition-colors ${idx === 0 ? "bg-secondary/5" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-10 h-10 rounded-full object-cover" alt={c.name} src={c.img} />
                      <div><p className="font-bold text-on-surface">{c.name}</p><p className="text-xs text-on-surface-variant">{c.joined}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="text-sm"><p className="text-on-surface">{c.email}</p><p className="text-on-surface-variant">{c.phone}</p></div></td>
                  <td className="px-6 py-4 font-bold text-on-surface">{c.wallet}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.tierColor}`}>{c.tier}</span></td>
                  <td className="px-6 py-4 text-on-surface">{c.orders}</td>
                  <td className="px-6 py-4 font-bold text-on-surface text-right">{c.spent}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer ${c.active ? "bg-secondary" : "bg-outline-variant"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${c.active ? "right-0.5" : "left-0.5"}`}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right"><button onClick={() => setDrawerOpen(true)} className="text-secondary font-bold text-sm hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-between">
          <p className="text-sm text-on-surface-variant font-label-caps">Showing 1-10 of 1,482 customers</p>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-surface-container rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="p-2 bg-white border border-surface-container rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[90]" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.1)] z-[100] flex flex-col">
            <div className="p-6 header-deep-gradient text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setDrawerOpen(false)}><span className="material-symbols-outlined">close</span></button>
                <h3 className="font-headline-md">Customer Profile</h3>
              </div>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">ID: PX-12842</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 border-b border-surface-container bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-20 h-20 rounded-xl border-4 border-white shadow-md object-cover" alt={active.name} src={active.img} />
                    <div>
                      <h4 className="font-headline-md text-on-surface">{active.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Platinum Member</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="text-xs font-bold text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-label-caps text-on-surface-variant">Active</span>
                    <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-b border-surface-container">
                <div className="header-deep-gradient p-5 rounded-xl text-white shadow-xl mb-6 flex justify-between items-center">
                  <div><p className="text-xs font-label-caps opacity-70">Current Wallet Balance</p><p className="text-display-lg font-price-lg mt-1">₹450.00</p></div>
                  <span className="material-symbols-outlined text-4xl opacity-20" style={fill1}>account_balance_wallet</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                  <h5 className="font-label-caps text-on-surface-variant mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm">edit_note</span> Manual Adjustment</h5>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Amount (₹)</label><input className="border border-surface-container bg-white rounded-lg p-2 focus:ring-secondary/20" type="number" defaultValue="0.00" /></div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Type</label>
                      <div className="flex p-1 bg-white border border-surface-container rounded-lg h-full">
                        <button className="flex-1 text-[10px] font-bold uppercase rounded py-1 bg-secondary text-white">Credit</button>
                        <button className="flex-1 text-[10px] font-bold uppercase rounded py-1 text-on-surface-variant">Debit</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Reason</label>
                    <select className="border border-surface-container bg-white rounded-lg p-2 text-sm"><option>Refund for Cancelled Order</option><option>Loyalty Bonus</option><option>Dispute Resolution</option><option>Other</option></select>
                  </div>
                  <button className="w-full primary-accent-gradient text-white py-2 rounded-lg font-button text-sm shadow-md">Apply Adjustment</button>
                </div>
              </div>
              <div className="p-6">
                <h5 className="font-label-caps text-on-surface-variant mb-4">Recent Orders</h5>
                <div className="space-y-2">
                  {[["#PX-2023-8901", "₹1,450", "Printing"], ["#PX-2023-8720", "₹3,980", "Delivered"], ["#PX-2023-8511", "₹620", "Delivered"]].map(([id, amt, st]) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="font-bold text-sm text-secondary">{id}</span>
                      <span className="text-sm">{amt}</span>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Order History | Bhagini Graphics" };


const tabs = ["All Orders (12)", "Current (3)", "Completed (8)", "Cancelled (1)"];

export default function MyOrders() {
  return (
    <>
      {/* Dark page header */}
      <section className="bg-primary-container text-white py-12 px-gutter">
        <div className="max-w-container-max mx-auto">
          <nav className="flex items-center gap-2 text-on-primary-container mb-4 font-label-caps">
            <Link className="hover:text-white transition-colors" href="/dashboard">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white">My Orders</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display-lg text-white mb-2">Order History · My Orders</h1>
              <p className="text-on-primary-container max-w-2xl">Manage your high-fidelity print projects, track real-time production status, and access design assets from previous orders.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[120px]">
                <p className="font-label-caps text-on-primary-container mb-1">Total Orders</p>
                <p className="font-price-lg text-white">12</p>
              </div>
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[100px] border-l-4 border-secondary">
                <p className="font-label-caps text-on-primary-container mb-1">Active</p>
                <p className="font-price-lg text-secondary-container">3</p>
              </div>
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[100px]">
                <p className="font-label-caps text-on-primary-container mb-1">Completed</p>
                <p className="font-price-lg text-white">8</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canvas */}
      <div className="canvas-bg px-gutter py-8">
        <div className="max-w-container-max mx-auto space-y-6">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all" placeholder="Search order ID, product name, or status" type="text" />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-4 py-3 border border-outline-variant rounded-lg bg-surface cursor-pointer hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                <span className="font-button text-on-surface">All Time</span>
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border border-outline-variant rounded-lg bg-surface cursor-pointer hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-[20px]">sort</span>
                <span className="font-button text-on-surface">Sort</span>
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 border border-secondary text-secondary rounded-lg font-button hover:bg-secondary/5 transition-colors">
                <span className="material-symbols-outlined text-[20px]">filter_list</span> Filters
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-outline-variant mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((t, i) => (
              <button key={t} className={i === 0 ? "px-6 py-4 border-b-2 border-secondary text-secondary font-bold whitespace-nowrap" : "px-6 py-4 border-b-2 border-transparent text-on-surface-variant hover:text-secondary font-medium whitespace-nowrap transition-colors"}>{t}</button>
            ))}
          </div>

          {/* Orders list */}
          <div className="space-y-6">
            {/* Active order */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-secondary-container hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary-container text-[32px]">print</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-headline-md text-primary">#PX-2024-08471</span>
                        <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-caps">Design Review</span>
                      </div>
                      <p className="text-on-surface-variant text-sm">Placed: Today, 02:45 PM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-price-lg text-primary">₹3,930</p>
                    <p className="text-on-surface-variant text-sm flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-[16px] text-green-600">account_balance_wallet</span> Paid via Wallet
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-surface-variant rounded-lg text-sm text-on-surface-variant font-medium">500 Business Cards x 1</span>
                  <span className="px-3 py-1 bg-surface-variant rounded-lg text-sm text-on-surface-variant font-medium">100 Trifold Brochures x 1</span>
                  <span className="px-3 py-1 bg-surface-variant rounded-lg text-sm text-on-surface-variant font-medium">50 A4 Flyers x 1</span>
                  <span className="px-3 py-1 border border-outline-variant rounded-lg text-sm text-on-surface-variant">Total Items: 3</span>
                </div>
                {/* Progress */}
                <div className="mb-8 px-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label-caps text-secondary font-bold">Step 3 of 6</span>
                    <span className="text-on-surface-variant text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span> Est. Delivery: 08 Jun
                    </span>
                  </div>
                  <div className="relative h-2 bg-surface-variant rounded-full mb-6 flex">
                    <div className="absolute h-full w-[45%] premium-gradient rounded-full"></div>
                    <div className="flex justify-between w-full -mt-2.5 relative">
                      <div className="w-7 h-7 rounded-full premium-gradient text-white flex items-center justify-center border-4 border-white shadow-sm"><span className="material-symbols-outlined text-[14px]">check</span></div>
                      <div className="w-7 h-7 rounded-full premium-gradient text-white flex items-center justify-center border-4 border-white shadow-sm"><span className="material-symbols-outlined text-[14px]">check</span></div>
                      <div className="w-7 h-7 rounded-full premium-gradient text-white flex items-center justify-center border-4 border-white shadow-sm ring-4 ring-secondary/20"><span className="material-symbols-outlined text-[14px]">edit_note</span></div>
                      <div className="w-7 h-7 rounded-full bg-surface-variant border-4 border-white"></div>
                      <div className="w-7 h-7 rounded-full bg-surface-variant border-4 border-white"></div>
                      <div className="w-7 h-7 rounded-full bg-surface-variant border-4 border-white"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant px-1">
                    <span>Placed</span><span>Payment</span><span className="text-secondary font-bold">Design Review</span><span>Printing</span><span>QC</span><span>Delivery</span>
                  </div>
                </div>
                <div className="bg-surface-variant/50 rounded-lg p-4 flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">info</span>
                  <p className="text-on-surface-variant font-medium">Team is reviewing your artwork files. Estimated time: 2-4 hours.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/orders/PX-2024-08471" className="flex-1 py-3 border border-outline-variant rounded-lg font-button hover:bg-surface-dim transition-colors text-center">View Details</Link>
                  <Link href="/orders/PX-2024-08471" className="flex-1 py-3 premium-gradient text-white rounded-lg font-button shadow-md active:scale-[0.98] transition-transform text-center">Track Order</Link>
                </div>
              </div>
            </div>

            {/* Awaiting files */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-amber-500">
              <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-[32px]">upload_file</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline-md text-primary">#PX-2024-08480</span>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-label-caps">Awaiting Files</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">Design upload pending • Order total locked</p>
                </div>
                <button className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white rounded-lg font-button shadow-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">cloud_upload</span> Upload Files
                </button>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-green-500 opacity-90 hover:opacity-100 transition-opacity">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-500 text-[32px]">check_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-headline-md text-primary">#PX-2024-07210</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-label-caps">Delivered</span>
                      </div>
                      <p className="text-on-surface-variant text-sm">Placed: 12 May 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-price-lg text-primary">₹2,139</p>
                    <p className="text-on-surface-variant text-sm">Paid via Wallet</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-surface-variant rounded-lg text-sm text-on-surface-variant font-medium">50 Luxury Packaging x 1</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-on-surface-variant text-sm">Quality Verified</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/orders/PX-2024-07210" className="flex-1 py-2 border border-outline-variant rounded-lg font-button hover:bg-surface-dim text-center">View Details</Link>
                  <button className="flex-1 py-2 border border-secondary text-secondary rounded-lg font-button hover:bg-secondary/5">Reorder</button>
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-error opacity-75">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-error-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-error text-[32px]">cancel</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-headline-md text-primary">#PX-2024-06150</span>
                        <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-caps">Cancelled</span>
                      </div>
                      <p className="text-on-surface-variant text-sm">Placed: 20 Apr 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-price-lg text-on-surface-variant line-through">₹2,100</p>
                    <p className="text-green-600 font-bold text-sm flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span> ₹2,100 Refunded to Wallet
                    </p>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant bg-error-container/20 p-3 rounded-lg border border-error/10">
                  <strong>Reason:</strong> Cancelled by customer · Reason: Order details change
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center py-8">
            <button className="px-8 py-3 border border-outline text-outline rounded-full font-button hover:border-secondary hover:text-secondary transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">expand_more</span> Load More Orders
            </button>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <section className="bg-tertiary-container text-white py-12 px-gutter">
        <div className="max-w-container-max mx-auto">
          <h3 className="font-headline-md text-on-tertiary mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined">analytics</span> Order Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[
              { label: "Total Spent", value: "₹18,470", valueColor: "text-white", sub: "Lifetime Value", subColor: "text-green-400", subIcon: "trending_up" },
              { label: "Items Printed", value: "6,625", valueColor: "text-white", sub: "Pages & Units", subColor: "text-on-tertiary-container" },
              { label: "Avg Delivery", value: "4.2 days", valueColor: "text-white", sub: "Fast turnaround", subColor: "text-on-tertiary-container" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-secondary-container transition-colors">
                <p className="font-label-caps text-on-tertiary-container mb-2">{s.label}</p>
                <p className={`font-price-lg ${s.valueColor}`}>{s.value}</p>
                <p className={`text-[10px] mt-2 flex items-center gap-1 ${s.subColor}`}>
                  {s.subIcon && <span className="material-symbols-outlined text-[12px]">{s.subIcon}</span>}
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "PrintX Admin | Dashboard" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const orders = [
  { id: "#PX-9021", initials: "VS", initialsBg: "bg-primary-fixed", client: "Vogue Studio", product: "Glossy Lookbooks (x500)", status: "In Print", statusBg: "bg-blue-100 text-blue-700", amount: "₹1,240" },
  { id: "#PX-8944", initials: "TR", initialsBg: "bg-secondary-fixed", client: "Terra Realty", product: "Gold Foil Business Cards", status: "Finishing", statusBg: "bg-yellow-100 text-yellow-700", amount: "₹450" },
  { id: "#PX-8912", initials: "MM", initialsBg: "bg-tertiary-fixed", client: "Metra Media", product: "Event Banners (Heavy Duty)", status: "Shipped", statusBg: "bg-green-100 text-green-700", amount: "₹2,100" },
];

const machines = [
  { name: "Heidelberg XL-106", job: "Active - Job: PX-9021", border: "border-green-500", dot: "text-green-500" },
  { name: "HP Indigo 12000", job: "Active - Job: PX-8944", border: "border-green-500", dot: "text-green-500" },
  { name: "Scodix Ultra 202", job: "Idle - Maintenance due", border: "border-yellow-500", dot: "text-yellow-500" },
];

export default function AdminDashboard() {
  return (
    <>
      <header className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary">Overview Dashboard</h2>
        <p className="text-on-surface-variant font-body-lg">Here&apos;s a snapshot of your printing press operations today.</p>
      </header>

      <div className="bento-grid">
        {/* Revenue */}
        <div className="col-span-4 lg:col-span-2 p-8 rounded-xl bg-primary-container text-on-primary flex flex-col justify-between overflow-hidden relative shadow-lg">
          <div className="relative z-10">
            <span className="text-label-caps font-label-caps opacity-60">Total Revenue (Monthly)</span>
            <div className="flex items-baseline gap-4 mt-2">
              <h3 className="font-display-lg text-display-lg text-secondary-container">₹12,45,920</h3>
              <span className="text-green-400 flex items-center text-sm font-bold"><span className="material-symbols-outlined text-xs">trending_up</span> 12.5%</span>
            </div>
          </div>
          <div className="mt-8 flex gap-2 h-16 items-end relative z-10">
            {["h-[20%]", "h-[40%]", "h-[35%]", "h-[75%]", "h-[60%]", "h-[90%]", "h-full"].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-sm ${i === 3 || i === 6 ? "bg-secondary-container" : "bg-white/10"} ${h}`}></div>
            ))}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        {/* Active Orders */}
        <div className="col-span-2 lg:col-span-1 p-8 rounded-xl bg-white shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-4"><span className="material-symbols-outlined text-secondary">print</span></div>
            <span className="text-label-caps text-on-surface-variant/60 uppercase">Active Orders</span>
            <h3 className="font-headline-md text-headline-md mt-1">482</h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden"><div className="bg-secondary-container h-full w-[65%]"></div></div>
            <p className="text-xs mt-2 text-on-surface-variant">65% Capacity reached</p>
          </div>
        </div>

        {/* Customers */}
        <div className="col-span-2 lg:col-span-1 p-8 rounded-xl bg-white shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-4"><span className="material-symbols-outlined text-primary">group</span></div>
            <span className="text-label-caps text-on-surface-variant/60 uppercase">Active Customers</span>
            <h3 className="font-headline-md text-headline-md mt-1">1,209</h3>
          </div>
          <p className="text-xs text-green-600 font-bold mt-4">+42 new this week</p>
        </div>

        {/* Order Queue */}
        <div className="col-span-4 lg:col-span-3 p-8 rounded-xl bg-white shadow-sm border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md">Recent Order Queue</h4>
            <Link href="/admin/orders" className="text-secondary font-button text-sm flex items-center gap-1 hover:underline">View All Orders <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant">
                <tr>
                  {["Order ID", "Client", "Product", "Status", "Amount"].map((h) => (
                    <th key={h} className="py-4 font-label-caps text-label-caps text-on-surface-variant/60 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                    <td className="py-4 font-bold text-primary">{o.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${o.initialsBg}`}>{o.initials}</div>
                        <span>{o.client}</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">{o.product}</td>
                    <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${o.statusBg}`}>{o.status}</span></td>
                    <td className="py-4 font-bold">{o.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine status */}
        <div className="col-span-4 lg:col-span-1 p-8 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-6">
          <h4 className="font-headline-md text-[18px]">Machine Status</h4>
          <div className="space-y-4">
            {machines.map((m) => (
              <div key={m.name} className={`flex justify-between items-center p-3 rounded-lg bg-white shadow-sm border-l-4 ${m.border}`}>
                <div>
                  <p className="text-sm font-bold">{m.name}</p>
                  <p className="text-[10px] text-on-surface-variant">{m.job}</p>
                </div>
                <span className={`material-symbols-outlined text-sm ${m.dot}`} style={fill1}>circle</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 rounded-lg bg-secondary-container/5 border border-secondary-container/20">
            <p className="text-xs font-bold text-secondary-container uppercase tracking-widest mb-1">Alert</p>
            <p className="text-sm text-on-surface leading-tight">Stock level for &apos;300gsm Silk&apos; is below 10%. Reorder recommended.</p>
          </div>
        </div>

        {/* Marketing spotlight */}
        <div className="col-span-4 p-8 rounded-xl bg-white shadow-sm border border-outline-variant relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 relative z-10">
            <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full tracking-widest">Campaign Insight</span>
            <h3 className="font-headline-lg text-headline-lg mt-4 mb-2">Summer Print Festival</h3>
            <p className="text-on-surface-variant max-w-lg mb-6">Your current &quot;Early Bird&quot; coupon for 15% off bulk orders has generated 120 uses in the last 48 hours. Converting 14% of previous catalog browsers.</p>
            <Link href="/admin/coupons" className="inline-block px-6 py-3 border-2 border-secondary-container text-secondary-container font-button rounded-lg hover:bg-secondary-container hover:text-on-secondary transition-all">Adjust Campaign Settings</Link>
          </div>
          <div className="absolute -left-10 top-0 h-full w-32 bg-secondary-container/5 -skew-x-12"></div>
        </div>
      </div>
    </>
  );
}

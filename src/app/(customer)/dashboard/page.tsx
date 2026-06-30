import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics | Customer Dashboard" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const quickActions: [string, string, string, string][] = [
  ["add_shopping_cart", "New Order", "bg-secondary-container text-on-secondary", "/products"],
  ["category", "Browse Products", "bg-blue-500 text-white", "/products"],
  ["payments", "Top Up Wallet", "bg-emerald-500 text-white", "/wallet"],
  ["local_shipping", "Track Order", "bg-orange-500 text-white", "/orders"],
  ["replay", "Reorder Last", "bg-purple-500 text-white", "/orders"],
  ["support_agent", "Get Support", "bg-cyan-500 text-white", "tel:+917203000701"],
];

const chart = [
  ["40", "12", "Jan"],
  ["60", "18", "Feb"],
  ["55", "15", "Mar"],
  ["85", "26", "Apr"],
  ["70", "21", "May"],
  ["95", "32", "Jun"],
];

const popular = [
  {
    name: "Business Cards",
    sub: "Premium Matte Finish",
    price: "From ₹450",
    unit: "/ 100 pcs",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8X-L0-qwsjcPDliscGDlN5O0O55FgaUoHGkS0YPawronrj3rJy3ig8xLkOOH7tb_Wvhzi93fZtQy6uNrUVfLWk_w_hFSr3NZpkruuQbFrsuJOfBXfFGUucipN201PrbTnVtVNQ1QihlTMWzz4lI39CBv6xDNMPfOE-qLfMKO-Z_fCfm3bF9sI81HOVquuY_cPyxr-tB0lTG1lstk03KdNYVTgvshK6XM5XN_iHNVyaGol2r8NVHHTKezU8MmKq1HEFlKf5YtJ-Ao",
  },
  {
    name: "Brochures",
    sub: "Tri-fold Glossy",
    price: "From ₹1,200",
    unit: "/ 50 pcs",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAoMc5BFAUqJtUg3fE9lIqJKIQ5KQwwkanrCtvChu-OOndMBg6WwITXlZVmtbk1BZCVAoJvc944FYOozJipsl8CdGzxV-V2pRldhUlsSI-803JdA4vOcXLn0oNqagEWb9QZ-56wkAau4xWyKtHM28loym5lWISLB_DCjNdimq8YEki81NGqeObFt2tfVN7Pq4_ouIn_LKg6Xt1a-gL9IdxpBeAvy6d7eSDfxHB2yFy0M1R9oBtH8h_TE8Ii9lKdi6YednahJZCG-o",
  },
  {
    name: "Flyers",
    sub: "Standard A5 Size",
    price: "From ₹850",
    unit: "/ 200 pcs",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6IjSTAZqgiQ-U1WKzYZB8al695_DO0lESM0Jk_T6ztwt6OzddQLS5bPidJZDYs6_nEEDugWZVGLhglXerdgePEXhS_mMwwt7psykoPtk-rCyEEeX6GHTUDaFSEzqj2kBYB5rVLCB8gyeS9ZsfYeGDl4zt4Dnkw_bt_VZGiKqm99I_FHu2peE2eroRAp2-5CDGOzgQQcD8Ocqi_mrDDEku9M8cx3DrV6wMHgS-hFn1pgB-dVc5msZpFjQBskWER3oXCg-RUAl9ZOo",
  },
];

export default function CustomerDashboard() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="header-deep-gradient rounded-xl p-8 text-on-primary flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-20 h-20 rounded-xl border-4 border-white/10 shadow-lg object-cover"
            alt="Priya Mehta"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9gFKbPwGGnKccfWZnrB3EQA7XPjMAC4-hf8cuYjabBD8DNLxejMFk3UIWZwfICezBEKqHOclnb9WyNcHmaNmEj07XU7O5LHNxZN-Y1JmpcBGT2P8Cd0yy4kHQmPZU2aIjScN6RgxNvJt3poTJ5DysEmM64awLynZfrCezphU6KBknuK1NpjGFhHuGVBWB5J8TgxHCMwA0JKrQ0XzhHpVV2jUp6db_VI28Z2rKvZ_L3FEHbvoPsXG3oFazpOOHEdgMaHsBJqt8lLU"
          />
          <div>
            <h1 className="font-headline-lg text-white">Good morning 👋 Priya Mehta</h1>
            <p className="text-on-primary-container/80 font-body-md mt-1">Active Member · Member since Jan 2024 · 47 orders placed</p>
          </div>
        </div>
        <div className="flex gap-4 z-10 w-full md:w-auto">
          <Link href="/products" className="primary-accent-gradient text-on-primary px-6 py-3 rounded-lg font-button flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 flex-1 md:flex-none">
            <span className="material-symbols-outlined">add_circle</span> New Print Order
          </Link>
          <Link href="/wallet" className="border-2 border-secondary-fixed-dim text-secondary-fixed-dim px-6 py-3 rounded-lg font-button hover:bg-white/5 transition-all active:scale-95 flex-1 md:flex-none text-center">
            Top Up Wallet
          </Link>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Wallet Balance</span>
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-price-lg text-headline-lg text-on-surface">₹2,450</span>
            <span className="text-xs font-bold text-green-600">+₹500</span>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-on-surface-variant"><span>65% OF MONTHLY BUDGET</span></div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
              <div className="h-full primary-accent-gradient" style={{ width: "65%" }}></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Total Orders</span>
            <span className="material-symbols-outlined text-on-primary-fixed-variant">print</span>
          </div>
          <div className="flex items-baseline gap-2"><span className="font-price-lg text-headline-lg text-on-surface">47</span></div>
          <p className="text-xs font-bold text-on-primary-fixed-variant mt-2 px-2 py-1 bg-primary-fixed/30 inline-block rounded">3 in progress</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Total Spent 2024</span>
            <span className="material-symbols-outlined text-on-primary-fixed-variant">payments</span>
          </div>
          <div className="flex items-baseline gap-2"><span className="font-price-lg text-headline-lg text-on-surface">₹18,340</span></div>
          <p className="text-xs font-bold text-on-surface-variant mt-2">Across 47 orders in 2024</p>
        </div>
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wallet panel */}
          <div className="header-deep-gradient rounded-xl p-8 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-on-primary-container text-xs uppercase tracking-widest font-bold mb-1">Your Wallet Balance</p>
                  <h2 className="text-white text-4xl font-black flex items-center gap-3">
                    ₹2,450 <span className="material-symbols-outlined text-green-400 text-2xl" style={fill1}>verified</span>
                  </h2>
                  <p className="text-on-primary-container/60 text-xs mt-2">Active &amp; Verified Digital Account</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-on-primary-container/50 font-bold uppercase">Used This Month</p><p className="text-sm text-on-primary font-bold">₹2,100</p></div>
                  <div><p className="text-[10px] text-on-primary-container/50 font-bold uppercase">Last Top-Up</p><p className="text-sm text-on-primary font-bold">₹500</p></div>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-end">
                <Link href="/wallet" className="bg-white text-primary-container px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-on-primary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span> Top Up Wallet
                </Link>
                <Link href="/wallet" className="glass-panel text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-sm">history</span> Transaction History
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          </div>

          {/* Quick Actions */}
          <section>
            <h3 className="font-headline-md text-on-surface mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map(([icon, label, color, href]) => {
                const cls = "bg-surface-container p-6 rounded-xl border border-outline-variant/10 hover:border-secondary/30 transition-all cursor-pointer group text-center flex flex-col items-center justify-center gap-3";
                const inner = (
                  <>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${color}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <span className="font-bold text-sm">{label}</span>
                  </>
                );
                return href.startsWith("tel:") || href.startsWith("mailto:") ? (
                  <a key={label} href={href} className={cls}>{inner}</a>
                ) : (
                  <Link key={label} href={href} className={cls}>{inner}</Link>
                );
              })}
            </div>
          </section>

          {/* Order Insights */}
          <section className="space-y-4">
            <h3 className="font-headline-md text-on-surface">Order Insights</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[["5", "Processing"], ["3", "Printing"], ["2", "Shipped"], ["37", "Delivered"]].map(([n, l]) => (
                <div key={l} className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 flex flex-col items-center">
                  <span className="text-headline-md font-black text-on-surface">{n}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{l}</span>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <p className="font-bold text-sm">Monthly Order Volume</p>
                <span className="text-xs text-on-surface-variant">Jan - Jun 2024</span>
              </div>
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {chart.map(([h, val, m]) => (
                  <div key={m} className="w-full bg-secondary/10 rounded-t-lg relative group" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 w-full primary-accent-gradient rounded-t-lg transition-all h-full"></div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold hidden group-hover:block">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant px-2 uppercase tracking-tighter">
                {chart.map(([, , m]) => <span key={m}>{m}</span>)}
              </div>
            </div>
          </section>

        </div>

        {/* Right sidebar */}
        <aside className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface text-lg">Notifications</h3>
              <a className="text-secondary font-bold text-xs hover:underline" href="#">Mark all read</a>
            </div>
            <div className="divide-y divide-outline-variant/10 max-h-[400px] overflow-y-auto custom-scrollbar">
              {[
                { dot: "bg-secondary", op: "", title: "Order #PX-998 Shipped", body: "Your order has been handed over to BlueDart. Track it now.", time: "2 hours ago" },
                { dot: "bg-secondary", op: "", title: "Wallet Credited ₹500", body: "Successful top-up via UPI. Check your balance.", time: "Yesterday" },
                { dot: "bg-outline-variant", op: "opacity-60", title: "Order #PX-1002 Ready", body: "Quality check passed. Ready for dispatch.", time: "2 days ago" },
                { dot: "bg-outline-variant", op: "opacity-60", title: "Maintenance Schedule", body: "Portal will be down for 2 hours on Sunday 2 AM.", time: "3 days ago" },
              ].map((n) => (
                <div key={n.title} className={`p-4 flex gap-4 hover:bg-surface transition-colors ${n.op}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.dot}`}></div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{n.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{n.body}</p>
                    <p className="text-[10px] text-on-surface-variant/60 font-bold mt-2 uppercase">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface text-center">
              <button className="text-on-surface-variant font-bold text-xs">See Past Notifications</button>
            </div>
          </div>

          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-3xl text-secondary">headset_mic</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">Need a Custom Quote?</h4>
              <p className="text-xs text-on-surface-variant mt-1">Our printing experts are available for bulk orders and special requirements.</p>
            </div>
            <a href="mailto:bhaginigraphics@gmail.com" className="block text-center w-full bg-primary-container text-white py-2.5 rounded-lg font-bold text-xs hover:bg-black transition-colors">Chat with Support</a>
          </div>
        </aside>
      </div>

      {/* Recent Activity (full width) */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-on-surface">Recent Activity</h3>
          <Link className="text-secondary font-bold text-xs hover:underline" href="/orders">View All</Link>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden shadow-sm">
          {[
            { icon: "description", iconBg: "bg-primary/5 text-primary", title: "#PX-1024 Business Cards (500pcs)", sub: "Order placed · Today, 10:45 AM", amt: "₹1,250", amtColor: "text-on-surface", badge: "Processing", badgeColor: "bg-blue-100 text-blue-700" },
            { icon: "account_balance_wallet", iconBg: "bg-green-50 text-green-600", title: "Wallet Top-up", sub: "Transaction ID: TXN-88219 · Yesterday", amt: "+₹500", amtColor: "text-green-600", badge: "Success", badgeColor: "bg-green-100 text-green-700" },
            { icon: "book", iconBg: "bg-primary/5 text-primary", title: "#PX-1002 Premium Brochures", sub: "Order Delivered · June 12, 2024", amt: "₹4,800", amtColor: "text-on-surface", badge: "Delivered", badgeColor: "bg-green-100 text-green-700" },
          ].map((a) => (
            <div key={a.title} className="p-5 flex items-center justify-between hover:bg-surface transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.iconBg}`}>
                  <span className="material-symbols-outlined text-xl">{a.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{a.title}</p>
                  <p className="text-xs text-on-surface-variant">{a.sub}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${a.amtColor}`}>{a.amt}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${a.badgeColor}`}>{a.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular (full width) */}
      <section>
        <h3 className="font-headline-md text-on-surface mb-4">Popular for Business</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popular.map((p) => (
            <div key={p.name} className="bg-white rounded-xl overflow-hidden shadow-md border border-outline-variant/10 group">
              <div className="h-32 bg-surface-variant relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} src={p.img} />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                <p className="text-xs text-on-surface-variant mb-3">{p.sub}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-xs">{p.price} <span className="font-normal text-[10px]">{p.unit}</span></p>
                  <Link href="/products" className="text-secondary font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">Order <span className="material-symbols-outlined text-xs">arrow_forward</span></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

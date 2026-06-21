import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Order Confirmed | PrintX" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const orderItems = [
  { name: "500 Business Cards", icon: "badge", specs: "Matte 350gsm • Standard Size • Express Delivery", status: "Design Ready", statusColor: "bg-green-100 text-green-700", note: "Priority Processing", noteIcon: "bolt", noteColor: "text-secondary-container", ring: "" },
  { name: "100 Trifold Brochures", icon: "menu_book", specs: "Glossy 170gsm • Standard Delivery", status: "Design Ready", statusColor: "bg-green-100 text-green-700", note: "Standard Shipping", noteIcon: "local_shipping", noteColor: "text-on-surface-variant", ring: "" },
  { name: "50 A4 Flyers", icon: "description", specs: "Economy Delivery", status: "Upload Pending", statusColor: "bg-amber-100 text-amber-700", note: "Awaiting File", noteIcon: "info", noteColor: "text-amber-600", ring: "ring-2 ring-amber-200" },
];

export default function OrderConfirmed() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative deep-navy-gradient py-20 overflow-hidden">
        <div className="absolute inset-0 confetti-pattern"></div>
        <div className="relative max-w-container-max mx-auto px-margin-desktop text-center">
          <div className="inline-flex items-center gap-2 bg-on-primary-fixed/10 backdrop-blur-md px-6 py-2 rounded-full border border-on-primary-fixed/20 mb-8 animate-bounce">
            <span className="material-symbols-outlined text-secondary-container" style={fill1}>check_circle</span>
            <span className="font-label-caps text-label-caps text-on-primary-fixed">Order Placed Successfully</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-white mb-4">Thank you, Priya! 🎉</h1>
          <p className="font-body-lg text-body-lg text-on-primary-container mb-8">Order Number <span className="font-bold text-on-primary-fixed">#PX-2024-08471</span></p>
          <div className="inline-block bg-primary-container text-on-primary-fixed font-button px-8 py-3 rounded-xl shadow-xl border border-outline/20">
            Paid via Wallet <span className="font-black">₹3,930</span>
          </div>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-desktop py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Timeline */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant">
              <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">analytics</span> Order Journey
              </h2>
              <div className="space-y-0 relative">
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                {[
                  { icon: "check", bg: "bg-green-500", title: "Order Placed", titleColor: "text-on-surface", meta: "Today, 02:45 PM", italic: true, extra: "₹3,930 deducted from Wallet", spin: false },
                  { icon: "check", bg: "bg-green-500", title: "Payment Confirmed", titleColor: "text-on-surface", meta: "TXN-9928374", italic: false, spin: false },
                  { icon: "sync", bg: "bg-secondary-container", title: "Design Review", titleColor: "text-on-surface", metaColored: "Team reviewing your files", spin: true },
                  { icon: "schedule", bg: "bg-surface-container-high text-on-surface-variant", title: "Printing", titleColor: "text-on-surface-variant", spin: false },
                  { icon: "local_shipping", bg: "bg-surface-container-high text-on-surface-variant", title: "Out for Delivery", titleColor: "text-on-surface-variant", meta: "ETA: 12 Jun", spin: false, last: true },
                ].map((s, i) => (
                  <div key={i} className={`relative flex items-start gap-8 ${s.last ? "" : "pb-10"}`}>
                    <div className={`z-10 rounded-full p-1 ring-4 ring-white ${s.bg.includes("text-") ? s.bg : `${s.bg} text-white`} ${s.spin ? "spin-slow" : ""}`}>
                      <span className="material-symbols-outlined text-sm block">{s.icon}</span>
                    </div>
                    <div>
                      <h3 className={`font-body-lg font-bold ${s.titleColor}`}>{s.title}</h3>
                      {s.meta && <p className={`text-sm text-on-surface-variant ${s.italic ? "italic" : ""}`}>{s.meta}</p>}
                      {s.metaColored && <p className="text-sm text-secondary font-medium">{s.metaColored}</p>}
                      {s.extra && <p className="text-sm text-on-surface mt-1">{s.extra}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert */}
            <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
                <div>
                  <h4 className="font-bold text-amber-900">Design file missing for A4 Flyers</h4>
                  <p className="text-sm text-amber-800">Please upload the print-ready PDF within 24 hours to avoid delivery delays.</p>
                </div>
              </div>
              <button className="primary-gradient text-white px-6 py-3 rounded-lg font-button shadow-lg hover:opacity-90 active:scale-95 transition-all whitespace-nowrap">Upload Now</button>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="font-headline-md text-headline-md px-2">Order Items (3)</h3>
              {orderItems.map((it) => (
                <div key={it.name} className={`bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex gap-6 hover:shadow-md transition-shadow ${it.ring}`}>
                  <div className="w-32 h-32 bg-surface-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-outline">{it.icon}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-headline-md text-lg">{it.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${it.statusColor}`}>{it.status}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">{it.specs}</p>
                    </div>
                    <div className={`flex items-center gap-2 ${it.noteColor}`}>
                      <span className="material-symbols-outlined text-sm">{it.noteIcon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{it.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery & Address */}
            <div className="bg-surface-container-low p-8 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">Expected Delivery</h3>
                  <div className="flex gap-2">
                    {[["Express", "08 Jun", true], ["Standard", "10 Jun", false], ["Economy", "12 Jun", false]].map(([t, d, active]) => (
                      <div key={t as string} className={`flex-1 bg-white p-4 rounded-xl text-center border border-outline-variant ${active ? "shadow-sm ring-2 ring-secondary-container/20" : "opacity-60"}`}>
                        <p className={`text-[10px] font-black uppercase mb-1 ${active ? "text-secondary-container" : "text-on-surface-variant"}`}>{t as string}</p>
                        <p className="font-bold text-lg">{d as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">Shipping Address</h3>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">home_pin</span>
                    <div>
                      <p className="font-bold">Priya Sharma</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">Suite 405, Creative Hub, Plot 12A<br />Hitech City, Hyderabad, 500081<br />Tel: +91 98765 43210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-gutter">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-outline-variant">
              <h3 className="font-headline-md text-lg mb-6">Payment Summary</h3>
              <div className="space-y-4 text-sm">
                {[["Item Subtotal", "₹3,495"], ["Delivery Fee", "₹148"], ["GST (18%)", "₹629"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-on-surface-variant"><span>{k}</span><span>{v}</span></div>
                ))}
                <div className="pt-4 border-t border-outline-variant flex justify-between text-on-surface-variant"><span>MRP Total</span><span>₹4,272</span></div>
                <div className="flex justify-between text-green-600 font-bold"><span>Wallet Discount (8%)</span><span>-₹342</span></div>
                <div className="pt-4 border-t-2 border-primary flex justify-between items-center">
                  <span className="font-black text-lg text-primary">Total Paid</span>
                  <span className="font-price-lg text-price-lg text-primary">₹3,930</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-container text-on-primary-fixed p-6 rounded-xl border border-on-primary-fixed/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined" style={fill1}>account_balance_wallet</span>
                <span className="font-bold">PrintX Wallet Payment</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center opacity-70"><span className="text-xs">Balance Before</span><span className="font-mono text-sm">₹4,900</span></div>
                <div className="flex justify-between items-center py-2 border-y border-white/10"><span className="text-xs font-bold">Debited Amount</span><span className="font-mono text-lg font-black text-secondary-container">-₹3,930</span></div>
                <div className="flex justify-between items-center"><span className="text-xs">Remaining Balance</span><span className="font-mono text-sm font-bold">₹970</span></div>
              </div>
            </div>

            <div className="bg-green-600 text-white p-4 rounded-xl flex items-center gap-3 shadow-md">
              <span className="material-symbols-outlined">celebration</span>
              <p className="font-bold text-sm">You saved ₹342 on this order!</p>
            </div>

            <div className="space-y-3">
              <Link href="/orders/PX-2024-08471" className="w-full bg-primary text-white py-4 rounded-xl font-button flex items-center justify-center gap-3 hover:bg-on-surface transition-colors shadow-lg">
                <span className="material-symbols-outlined text-xl">map</span> Track My Order
              </Link>
              <button className="w-full bg-white border-2 border-secondary text-secondary py-4 rounded-xl font-button flex items-center justify-center gap-3 hover:bg-secondary/5 transition-colors">
                <span className="material-symbols-outlined text-xl">upload_file</span> Upload Design File
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/orders" className="bg-surface-container-high py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined">receipt_long</span> My Orders
                </Link>
                <Link href="/products" className="bg-surface-container-high py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined">shopping_bag</span> Shopping
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Confirmation Email Sent</p>
                <p className="text-sm font-bold">priya@studio.com</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white rounded-lg hover:text-secondary transition-colors" title="Download Invoice"><span className="material-symbols-outlined">download</span></button>
                <button className="p-2 bg-white rounded-lg hover:text-secondary transition-colors" title="Share Order"><span className="material-symbols-outlined">share</span></button>
              </div>
            </div>

            <div className="bg-error-container p-6 rounded-xl border border-error/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error">priority_high</span>
                <span className="text-sm font-bold text-on-error-container">Low Wallet Balance</span>
              </div>
              <Link href="/wallet" className="text-xs font-black bg-white px-3 py-1.5 rounded-lg text-error uppercase tracking-wider shadow-sm hover:shadow transition-all">Top Up</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

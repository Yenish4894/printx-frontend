import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics | Order Details" };

// Pre-rendered order pages for static export
export function generateStaticParams() {
  return [{ id: "PX-2024-08471" }, { id: "PX-2024-07210" }];
}

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const items = [
  {
    name: "500 Business Cards", status: "Approved", statusColor: "text-green-600", statusIcon: "check_circle", border: "border-green-500",
    specs: [["PAPER", "Matte 350gsm"], ["SIZE", "85x55mm"], ["PRINTING", "Double Sided"], ["FINISH", "Spot UV"]],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA72JjPW6YO0DfOrHl9h1ingZN1nsgBni78rf8hXtlhg1GQevE0TulZ7BaYtW98kXVZhnbyLbjEySxOu7P_wDxuCLQuwKI8TIHWYSnfAKYggOdKzRgbC0_QWHehA3ZjNUeH3uFMDIqF09gJ1J4q6vO8ZxQ0fI4GyqTzzpH9UjLgb8IQfJXWnqNrL8GSH0Wo7p57tZuvUXeBJYDVZr6mUX5FXSJsMslBngH0-p3CwflAn9-GYknAgcSg9IEk6eQy7Lf8AuxYhZw_BdM",
  },
  {
    name: "100 Trifold Brochures", status: "Approved", statusColor: "text-green-600", statusIcon: "check_circle", border: "border-green-500",
    specs: [["PAPER", "Glossy 170gsm"], ["SIZE", "A4"], ["PRINTING", "Double Sided"], ["FOLDING", "Trifold"]],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3X_JHjHXn-HlRi5fu_hbTyjN0OnrqiHEbKIcbTHZMxDJCR-lUnIxx-nQpyE6DSWXhGlyvHyAJYLqaZDV32sqWNFw60urBHTo7FqRRcNH5xYedJTy3fyQ1QeQNfvezXxDg0loGf0OloLucO0yjKuOSwJEsZIrXtDo25CkWztrAazwUjwS5oKk-VcU_lDlZDoktu1YsVbj5i7CkFn6OJjpntp8PTHVXcbK6yIh1qi-NJBr7jsFFbf1BZUfReNHUeSeImw7lDsre8p4",
  },
];

const timeline = [
  { icon: "check", title: "Order Placed", desc: "Your order has been received and added to the queue.", time: "02:45 PM", done: true },
  { icon: "check", title: "Payment Verified", desc: "TXN-9928374 · Paid via Bhagini Wallet", time: "03:10 PM", done: true },
];

const future = [
  ["hourglass_empty", "Printing & Production"],
  ["verified", "Quality Check"],
  ["local_shipping", "Out for Delivery"],
];

const quickActions: [string, string, string][] = [
  ["upload_file", "Upload Missing File", "text-secondary"],
  ["history", "Request Reprint", "text-on-surface-variant"],
  ["support_agent", "Contact Support", "text-on-surface-variant"],
  ["refresh", "Reorder Same Items", "text-on-surface-variant"],
];

export default function OrderDetails() {
  return (
    <main className="pb-12 px-margin-desktop max-w-container-max mx-auto pt-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 group w-fit">
          <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-button text-button">Back to Orders</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-headline-lg font-headline-lg">Order #PX-2024-08471</h1>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-label-caps font-label-caps flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">sync</span> In Progress
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-on-surface-variant text-body-md font-body-md">
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1">calendar_today</span> Placed 02 June 2024</span>
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1">layers</span> Multi-item (3)</span>
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1">local_shipping</span> Estimated Delivery: 8–10 Jun</span>
            </div>
          </div>
          <div className="bg-primary-container text-white p-4 px-6 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-caps font-label-caps opacity-70">TOTAL PAID</p>
              <p className="text-headline-md font-headline-md">₹3,930</p>
            </div>
            <span className="material-symbols-outlined text-secondary text-3xl" style={fill1}>check_circle</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left */}
        <div className="lg:col-span-2 space-y-gutter">
          {/* Live status */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="p-gutter border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-headline-md font-headline-md">Live Order Status</h2>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Updated 5 mins ago</span>
            </div>
            <div className="p-gutter">
              <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-body-lg font-body-lg text-primary">45% Complete · <span className="text-secondary">Step 3 of 6</span></p>
                  <p className="text-label-caps font-label-caps text-on-surface-variant">Design Review</p>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div className="relative pl-8 space-y-10">
                <div className="status-timeline-line"></div>
                {timeline.map((s) => (
                  <div key={s.title} className="relative">
                    <div className="absolute -left-[29px] top-0 bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center z-10 shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-body-lg">{s.title}</h4>
                        <p className="text-on-surface-variant text-body-md">{s.desc}</p>
                      </div>
                      <span className="text-label-caps font-label-caps text-on-surface-variant">{s.time}</span>
                    </div>
                  </div>
                ))}
                {/* Active */}
                <div className="relative">
                  <div className="absolute -left-[32px] -top-1 bg-white border-4 border-secondary rounded-full h-8 w-8 flex items-center justify-center z-10 shadow-md">
                    <span className="material-symbols-outlined text-secondary text-[20px] animate-pulse">sync</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-body-lg text-amber-900">Design Review</h4>
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Action Required</span>
                    </div>
                    <p className="text-amber-800 text-body-md mb-4 flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600">warning</span>
                      Item #3: A4 Flyers design file is missing or corrupted. Please re-upload to proceed.
                    </p>
                    <button className="coral-gradient text-white px-6 py-2 rounded-lg font-button text-button shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform">
                      <span className="material-symbols-outlined">upload</span> Upload File
                    </button>
                  </div>
                </div>
                {future.map(([icon, title]) => (
                  <div key={title} className="relative opacity-40">
                    <div className="absolute -left-[29px] top-0 bg-surface-variant text-on-surface-variant rounded-full h-6 w-6 flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                    <h4 className="font-bold text-body-lg">{title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="space-y-6">
            <h2 className="text-headline-md font-headline-md">Order Items &amp; Configuration</h2>
            {items.map((it) => (
              <div key={it.name} className={`bg-surface-container-lowest rounded-xl premium-shadow p-6 border-l-4 ${it.border} flex flex-col md:flex-row gap-6`}>
                <div className="w-32 h-32 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt={it.name} src={it.img} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-body-lg font-bold">{it.name}</h3>
                    <span className={`flex items-center font-bold text-label-caps ${it.statusColor}`}>
                      <span className="material-symbols-outlined mr-1 text-[16px]">{it.statusIcon}</span> {it.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-md text-on-surface-variant mb-4">
                    {it.specs.map(([k, v]) => (
                      <div key={k}><span className="text-label-caps block opacity-60">{k}</span> {v}</div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button className="text-secondary font-button text-button flex items-center hover:underline"><span className="material-symbols-outlined mr-1">visibility</span> Preview</button>
                    <button className="text-on-surface-variant font-button text-button flex items-center hover:text-primary"><span className="material-symbols-outlined mr-1">download</span> Download File</button>
                  </div>
                </div>
              </div>
            ))}
            {/* Action-required item */}
            <div className="bg-surface-container-lowest rounded-xl premium-shadow p-6 border-l-4 border-amber-500">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-32 h-32 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-4xl">description</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-body-lg font-bold">50 A4 Flyers</h3>
                    <span className="text-amber-600 flex items-center font-bold text-label-caps">
                      <span className="material-symbols-outlined mr-1 text-[16px]">warning</span> File Required
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-md text-on-surface-variant mb-4">
                    {[["PAPER", "Economy 100gsm"], ["SIZE", "A4"], ["PRINTING", "Single Sided"], ["FINISH", "None"]].map(([k, v]) => (
                      <div key={k}><span className="text-label-caps block opacity-60">{k}</span> {v}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="upload-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <span className="material-symbols-outlined text-secondary text-5xl mb-3">cloud_upload</span>
                <p className="text-body-lg font-bold mb-1">Upload Design for Flyers</p>
                <p className="text-body-md text-on-surface-variant">Drag and drop your file here, or browse files</p>
                <p className="text-label-caps font-label-caps text-outline mt-2 uppercase">PDF, AI, PSD, OR EPS (MAX 50MB)</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-gutter">
          {/* Invoice */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-body-lg font-bold">Invoice &amp; Payment</h2>
              <button className="text-secondary font-button text-sm flex items-center hover:underline"><span className="material-symbols-outlined text-sm mr-1">download</span> PDF</button>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-6"><span className="text-on-surface-variant text-body-md">Invoice Number</span><span className="font-bold text-body-md">#PX-INV-08471</span></div>
              <div className="space-y-3 mb-6">
                {[["500 Business Cards", "₹1,450"], ["100 Trifold Brochures", "₹1,251"], ["50 A4 Flyers", "₹600"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-body-md"><span className="text-on-surface-variant">{k}</span><span>{v}</span></div>
                ))}
              </div>
              <div className="pt-6 border-t border-outline-variant space-y-3 mb-6">
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Subtotal</span><span>₹3,301</span></div>
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Shipping</span><span className="text-green-600 font-bold uppercase text-xs">FREE</span></div>
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">GST (18%)</span><span>₹629</span></div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-body-lg">Total Paid</span>
                <span className="text-headline-md font-headline-md text-primary">₹3,930</span>
              </div>
              <div className="bg-surface-container rounded-lg p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" style={fill1}>account_balance_wallet</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">PAID VIA PRINTX WALLET</span>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="bg-white rounded-xl premium-shadow p-6 space-y-3">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-4">QUICK ACTIONS</h3>
            {quickActions.map(([icon, label, color]) => (
              <button key={label} className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                <span className="flex items-center gap-3 font-bold text-body-md">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span> {label}
                </span>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
              </button>
            ))}
            <button className="w-full mt-4 flex flex-col items-center justify-center p-4 rounded-lg border border-error/20 text-error hover:bg-error/5 transition-colors">
              <span className="font-bold text-body-md">Cancel Order</span>
              <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70 mt-1">Full wallet refund if cancelled now</span>
            </button>
          </section>

          {/* File requirements */}
          <section className="bg-primary-container text-white rounded-xl p-6">
            <h3 className="font-bold text-body-lg mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">verified</span> File Requirements</h3>
            <ul className="space-y-3">
              {["300 DPI Resolution", "CMYK Color Mode", "3mm Bleed Margins", "PDF, AI, PSD, or EPS"].map((r) => (
                <li key={r} className="flex items-center gap-3 text-body-md opacity-90"><span className="material-symbols-outlined text-green-400 text-sm">check</span> {r}</li>
              ))}
            </ul>
          </section>

          {/* Delivery */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-4">DELIVERY INFORMATION</h3>
            <div className="flex gap-4 mb-4">
              <div className="h-10 w-10 bg-surface-container rounded-full flex items-center justify-center text-secondary"><span className="material-symbols-outlined">location_on</span></div>
              <div>
                <p className="font-bold text-body-md">Priya Sharma</p>
                <p className="text-on-surface-variant text-sm leading-relaxed">B-42, Sector 62, Noida,<br />Uttar Pradesh, 201309</p>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
              <div><p className="text-label-caps font-label-caps opacity-60">COURIER</p><p className="font-bold text-body-md">BlueDart</p></div>
              <div className="text-right"><p className="text-label-caps font-label-caps opacity-60">EXPECTED BY</p><p className="font-bold text-body-md text-secondary">8–10 Jun</p></div>
            </div>
          </section>

          {/* Help */}
          <section className="bg-surface-container-high rounded-xl p-6 text-center">
            <p className="font-bold text-body-lg mb-1">Need Help?</p>
            <p className="text-on-surface-variant text-sm mb-6">Our average response time is under 2 hours.</p>
            <div className="grid grid-cols-3 gap-3">
              {[["chat", "WhatsApp", "https://wa.me/917203000701"], ["call", "Call", "tel:+917203000701"], ["mail", "Email", "mailto:bhaginigraphics@gmail.com"]].map(([icon, label, href]) => (
                <a key={label} className="flex flex-col items-center gap-2 group" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase">{label}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

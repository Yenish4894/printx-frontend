import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics Admin | Order Detail" };

// Pre-rendered admin order pages for static export
export function generateStaticParams() {
  return [{ id: "PX-2023-8901" }, { id: "PX-2024-08471" }];
}

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const steps = [
  { icon: "check_circle", label: "Placed", done: true },
  { icon: "payments", label: "Paid", done: true },
  { icon: "edit_document", label: "Review", done: true },
  { icon: "print", label: "Printing", active: true },
  { icon: "verified", label: "Quality", done: false },
  { icon: "local_shipping", label: "Delivered", done: false },
];

export default function AdminOrderDetail() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps mb-2">
            <Link className="hover:text-secondary" href="/admin/orders">Orders</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">#PX-2023-8901</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-primary">Order #PX-2023-8901</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Printing</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select defaultValue="Printing" className="text-sm border border-outline-variant rounded-lg bg-white px-3 py-2 focus:ring-secondary">
            <option>Placed</option><option>Payment Confirmed</option><option>Design Review</option><option>Printing</option><option>Quality Check</option><option>Out for Delivery</option><option>Delivered</option>
          </select>
          <button className="bg-primary text-white px-5 py-2 rounded-lg font-button text-sm hover:opacity-90 transition-opacity">Update Status</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 sm:gap-8 pb-24">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Progress timeline */}
          <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-headline-md text-lg text-primary">Order Progress</h3>
              <button className="text-secondary font-button text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">history</span> View Detailed Log</button>
            </div>
            <div className="relative flex items-center justify-between mb-12">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-surface-container-high z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] coral-gradient z-10" style={{ width: "60%" }}></div>
              {steps.map((s) => (
                <div key={s.label} className="relative z-20 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.active ? "coral-gradient text-white shadow-lg ring-4 ring-secondary-container/20" : s.done ? "bg-secondary text-white shadow-md" : "bg-surface-container-high text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined text-lg" style={s.done || s.active ? fill1 : undefined}>{s.icon}</span>
                  </div>
                  <span className={`font-label-caps text-label-caps ${s.active ? "text-secondary font-bold" : s.done ? "text-secondary" : "text-on-surface-variant"}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 pt-8 border-t border-outline-variant/30">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Internal Processing Note</label>
                <textarea className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-secondary h-24 placeholder:italic" placeholder="Add specific instructions for the printing floor..."></textarea>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-secondary">
                  <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold">Latest Update</p>
                  <p className="text-sm font-medium text-primary">Alexander Press moved order to <span className="text-secondary">Printing</span></p>
                  <p className="text-[11px] text-on-surface-variant opacity-70">Oct 25, 2024 • 10:00 AM</p>
                </div>
                <button className="coral-gradient w-full py-4 rounded-lg text-white font-button text-button shadow-lg active:scale-95 transition-transform">Advance to Quality Check</button>
              </div>
            </div>
          </section>

          {/* Order items */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="px-5 sm:px-8 py-5 bg-surface-container border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-lg text-primary uppercase tracking-tight">Order Items &amp; Configuration</h3>
              <span className="text-sm font-medium text-on-surface-variant">2 Items Total</span>
            </div>
            {/* Item 1 */}
            <div className="p-5 sm:p-8 border-b border-outline-variant/30">
              <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
                <div className="w-32 h-32 rounded-lg bg-surface flex-shrink-0 overflow-hidden border border-outline-variant/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="Business Cards" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA26YWGmQblm-NLb8k_efd2zDf9Y_q3erquXmkW5aM2CeiKXn1oN5cHodvHzHQ9nLC2reZ7sJY7pCq9Bm29A5tzd940iZDhgk4JOEnzacadz28pfH0jbMHbt18LfV9cm58DlmmuBG2WqOTP2E6bCYX-gvgmRXklCcgYjurcxM5rJC0xQ2Km2HfVVJLz5kRJVv67qqvA2kwrL5isfJvBuHbmUkdyu9vJ-d2EQfIXmlDm3bPrq0UbSOfu5tfZEnGatW2rfPkM82CoK38" />
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-headline-md text-lg text-primary">Business Cards - Luxe Series</h4>
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase">Approved</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2">
                      {[["Quantity", "500 Units"], ["Material", "300gsm Art Card"], ["Finish", "Matte Lamination"], ["Special", "Rounded Corners"]].map(([k, v]) => (
                        <div key={k} className="flex flex-col"><span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{k}</span><span className="text-sm font-medium">{v}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div><p className="text-[10px] text-on-surface-variant uppercase font-bold">Unit Price</p><p className="text-lg font-bold">₹2.90</p></div>
                    <div className="pt-4 border-t border-outline-variant/20"><p className="text-[10px] text-on-surface-variant uppercase font-bold">Line Total</p><p className="text-xl font-extrabold text-secondary">₹1,450</p></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button className="px-6 py-2 border border-outline text-outline font-button text-sm rounded-lg hover:bg-surface-container transition-colors">Reject Artwork</button>
                <button className="px-6 py-2 bg-secondary/10 text-secondary border border-secondary font-button text-sm rounded-lg hover:bg-secondary/20 transition-colors">Approve Files</button>
              </div>
            </div>
            {/* Item 2 */}
            <div className="p-5 sm:p-8 bg-error-container/20">
              <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
                <div className="w-32 h-32 rounded-lg bg-error-container/30 border-2 border-dashed border-error/40 flex flex-col items-center justify-center text-error">
                  <span className="material-symbols-outlined text-4xl mb-1">warning</span><span className="text-[10px] font-bold uppercase">Missing</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-headline-md text-lg text-primary">A4 Company Letterheads</h4>
                    <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Action Required</span>
                  </div>
                  <p className="text-sm text-on-error-container mb-4">Artwork file not found or corrupted. Customer has been notified to re-upload design files for this item.</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-error text-white px-4 py-2 rounded font-button text-xs flex items-center gap-2"><span className="material-symbols-outlined text-xs">mail</span> Notify Customer Again</button>
                    <button className="border border-error text-error px-4 py-2 rounded font-button text-xs">Cancel this Item</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Customer */}
          <section className="bg-primary-container p-5 sm:p-8 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-secondary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="Meera Kapoor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM1p0EwjOyFipOpnvYAhRr-Vs7CGhOTOxynoKUPU4cIWE7pRF2Kfg56i-eXJ-P4eCLXj-1aS8x6mvlK06rjlhiU90G0m6oQxrzd-T1XclrYoSqBeYDsTuWXGrR5clQCsPy30h6RiA2aWo46E3zXN5hREw99h0T8hcy5j3r5OiwVt16ucba03HK-ax_ipcW-1ZBCHtt5ptGyxJ77aYMs-z17D1_zLuPPGqVlwZGCXey6iQ4zHrMGcAVxgr0k6B2kii99d2DwxYL6AE" />
                </div>
                <div><h4 className="text-white font-headline-lg text-xl">Meera Kapoor</h4><p className="text-on-primary-container/70 text-sm">Platinum Member</p></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm">mail</span><span className="text-on-primary-container/90 text-sm">m.kapoor@designstudio.in</span></div>
                <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm">call</span><span className="text-on-primary-container/90 text-sm">+91 98765 43210</span></div>
                <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm">location_on</span><span className="text-on-primary-container/90 text-sm">B/402, Skyline Apartments, Worli Sea Face, Mumbai 400018</span></div>
                <div className="pt-6 mt-6 border-t border-on-primary-container/10 flex justify-between items-center">
                  <div><p className="text-[10px] text-on-primary-container/50 uppercase font-bold">Wallet Balance</p><p className="text-2xl font-black text-white">₹450.00</p></div>
                  <button className="bg-secondary/20 text-secondary p-2 rounded-lg hover:bg-secondary/30 transition-colors"><span className="material-symbols-outlined">account_balance_wallet</span></button>
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
            <h3 className="font-headline-md text-lg text-primary mb-6 uppercase tracking-tight">Payment Summary</h3>
            <div className="space-y-3 mb-8">
              {[["Subtotal", "₹1,450.00", ""], ["Delivery Fee", "₹100.00", ""], ["GST (18%)", "₹279.00", "text-error"], ["Wallet Discount", "-₹116.00", "text-secondary"]].map(([k, v, c]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-on-surface-variant">{k}</span><span className={`font-medium ${c}`}>{v}</span></div>
              ))}
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center"><span className="font-bold text-primary">Grand Total</span><span className="font-price-lg text-price-lg text-secondary">₹1,713.00</span></div>
            </div>
            <button className="w-full py-4 border-2 border-secondary text-secondary font-button text-button rounded-lg hover:bg-secondary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined">receipt_long</span> Generate GST Invoice</button>
          </section>

          {/* Control center */}
          <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow border-t-4 border-secondary">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-6 uppercase">Control Center</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-surface border border-outline-variant rounded-lg text-xs font-bold hover:bg-secondary/10 hover:border-secondary transition-all flex flex-col items-center gap-2"><span className="material-symbols-outlined text-secondary">check_circle</span> Approve All</button>
                <button className="p-3 bg-surface border border-outline-variant rounded-lg text-xs font-bold hover:bg-error/10 hover:border-error transition-all flex flex-col items-center gap-2"><span className="material-symbols-outlined text-error">cancel</span> Cancel Order</button>
              </div>
              <div className="bg-surface p-4 rounded-lg border border-outline-variant space-y-4">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Assign Courier</p>
                <div className="space-y-3">
                  <select className="w-full text-sm border border-outline-variant rounded bg-white p-2"><option>Select Partner</option><option>Delhivery Premium</option><option>BlueDart Express</option><option>Local Courier</option></select>
                  <input className="w-full text-sm border border-outline-variant rounded bg-white p-2" placeholder="Tracking ID" type="text" />
                </div>
              </div>
              <button className="w-full py-3 bg-primary text-white rounded-lg text-sm font-button hover:opacity-90 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">replay</span> Issue Reprint</button>
              <div className="pt-4 flex gap-2">
                <button className="flex-grow py-2 bg-[#25D366] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">chat</span> WhatsApp</button>
                <button className="flex-grow py-2 bg-on-surface-variant text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">mail</span> Email</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-surface/90 backdrop-blur-md px-4 md:px-10 py-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-5 sm:gap-8">
          <div><p className="text-[10px] uppercase font-bold text-on-surface-variant">Placed On</p><p className="text-sm font-medium">Oct 24, 02:30 PM</p></div>
          <div><p className="text-[10px] uppercase font-bold text-on-surface-variant">Target Delivery</p><p className="text-sm font-medium">Oct 28, 2024</p></div>
          <div className="hidden sm:block h-8 w-px bg-outline-variant"></div>
          <div className="hidden sm:flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span><span className="text-sm font-bold text-secondary">Currently with Printing Floor</span></div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 border border-outline rounded-lg text-sm font-button hover:bg-surface-container transition-colors">Process Refund</button>
          <button className="px-5 sm:px-8 py-2 coral-gradient text-white rounded-lg text-sm font-button shadow-md active:scale-95 transition-transform">Update Status</button>
        </div>
      </div>
    </>
  );
}

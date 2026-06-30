import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics Admin | Product Editor" };

const SwitchOn = () => (
  <button className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent bg-secondary-container">
    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow"></span>
  </button>
);
const SwitchOff = () => (
  <button className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent bg-white/20">
    <span className="translate-x-0 inline-block h-4 w-4 rounded-full bg-white shadow"></span>
  </button>
);

export default function ProductEditor() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps mb-2">
            <Link className="hover:text-secondary-container" href="/admin/products">Products</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Edit Product</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Business Cards</h2>
          <p className="text-body-md text-on-surface-variant">Update the primary details and display settings for your flagship stationery product.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span><span className="font-label-caps text-label-caps">Draft</span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant italic">Last edited 2 mins ago</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 pb-24">
        {/* Main form */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Basic Info */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container">info</span> Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Product Name</label>
                <input className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary" type="text" defaultValue="Business Cards" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline-variant/30 bg-surface-container-low text-on-surface-variant text-body-md">printx.in/</span>
                  <input className="flex-1 min-w-0 w-full bg-surface border border-outline-variant/30 rounded-r-lg p-3 text-body-md focus:ring-secondary focus:border-secondary" type="text" defaultValue="business-cards" />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Category</label>
                <select className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary"><option>Stationery</option><option>Marketing</option><option>Signage</option></select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Description</label>
                <textarea className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md focus:ring-secondary focus:border-secondary" rows={4} defaultValue="High-quality, professional business cards with a range of finishes. Perfect for networking and making a lasting impression." />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Badges</label>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container/10 border border-secondary-container/30 text-on-secondary-container rounded-full text-label-caps font-label-caps cursor-pointer"><input defaultChecked className="hidden" type="checkbox" /> Best Seller</label>
                  <label className="inline-flex items-center gap-1 px-3 py-1 bg-surface border border-outline-variant/30 text-on-surface-variant rounded-full text-label-caps font-label-caps cursor-pointer hover:border-secondary-container/50"><input className="hidden" type="checkbox" /> New</label>
                  <label className="inline-flex items-center gap-1 px-3 py-1 bg-surface border border-outline-variant/30 text-on-surface-variant rounded-full text-label-caps font-label-caps cursor-pointer hover:border-secondary-container/50"><input className="hidden" type="checkbox" /> Eco-friendly</label>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Status: <span className="text-on-surface font-bold">Active</span></span>
                  <SwitchOn />
                </div>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container">photo_library</span> Media</h3>
              <button className="text-secondary font-button flex items-center gap-1 hover:underline"><span className="material-symbols-outlined">add</span> Upload More</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="relative aspect-square rounded-lg border-2 border-secondary-container overflow-hidden">
                <div className="absolute top-2 left-2 z-10 bg-secondary-container text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Primary</div>
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB24z7E-FTBUR_W_cK6UIcBUC9jRGJbqzocKsLwN16Y4rUFtlJBos7FaZJhhmx6S6exeMfxXI-aaHnM_6thZJLKMZzeZgs9nRsuUMNG3EiAnaGyoEoJDlnrcqELeUbdYg4by89uHbq-LI-r4nYLvj4rIYOaH4H_rXHXlJAakRbpS49GN276w6gF8jI8ZGj3g5XnNEZ1cRFVJs_TsyI5qS98C3cDthq34VV6LlRveBM3Yc54benOetA455U72lxBlZ8EF8biivYFgkc')" }}></div>
              </div>
              <div className="relative aspect-square rounded-lg border border-outline-variant/30 overflow-hidden">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9r5DdBhdTZsmsIbqo_HaPTcehnt2o2pQnnDcSA0Zl09B-AKV5dxsR5a99x9E2CY3XkaB1X88cmnbaawkmzwvdk9K_8wFZuDZhisVD4az5bJvMx9WkmV84-HFTRYr3pd2JOvQvJb4IEPzoBSw9BpKUZR1yj4l_UW27R2va9AdZ3S9_Av_ejehguCGZ-_1k2Cy0sDxClHKaXj1giVtYzO03BcHMYexdznxkA1xzFKm0QPSda-pq3SJUj7b_1pOFCsEwDBNfOy2VufA')" }}></div>
              </div>
              <div className="border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center aspect-square hover:border-secondary-container hover:bg-secondary-container/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">upload_file</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Drop to add</span>
              </div>
            </div>
          </section>

          {/* Metadata */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container">architecture</span> Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Print Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input defaultChecked className="text-secondary focus:ring-secondary" name="print_type" type="radio" /><span className="text-body-md">Digital</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input className="text-secondary focus:ring-secondary" name="print_type" type="radio" /><span className="text-body-md">Offset</span></label>
                  </div>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Standard Size Label</label>
                  <input className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md" type="text" defaultValue="85mm x 55mm" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Bleed Area (mm)</label>
                  <input className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-body-md" type="number" defaultValue={3} />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Allowed File Formats</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["PDF", "AI", "PSD"].map((f) => <span key={f} className="px-3 py-1 bg-surface-container-high rounded text-label-caps font-label-caps">{f}</span>)}
                    <button className="px-2 py-1 border border-outline-variant/50 rounded text-label-caps font-label-caps hover:bg-surface-container-low">+</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section className="bg-primary-container text-white rounded-xl shadow-xl p-8 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/20 blur-3xl rounded-full"></div>
            <h3 className="font-headline-md text-headline-md mb-6 relative z-10 flex items-center gap-2 text-white"><span className="material-symbols-outlined">payments</span> Pricing Model</h3>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="flex items-center p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input className="text-secondary-container bg-transparent border-white/30" name="pricing" type="radio" />
                  <div className="ml-3"><p className="text-body-md font-bold">Tiered Pricing</p><p className="text-[10px] text-on-primary-container">Price reduces with higher quantities</p></div>
                </label>
                <label className="flex items-center p-3 rounded-lg border border-secondary-container bg-secondary-container/10 cursor-pointer transition-colors">
                  <input defaultChecked className="text-secondary-container bg-transparent border-white/30" name="pricing" type="radio" />
                  <div className="ml-3"><p className="text-body-md font-bold">Per-Unit Pricing</p><p className="text-[10px] text-on-primary-container">Fixed cost per unit produced</p></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] uppercase font-bold text-on-primary-container mb-1">Unit Type</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-body-md" type="text" defaultValue="piece" /></div>
                <div><label className="block text-[10px] uppercase font-bold text-on-primary-container mb-1">Unit Rate (₹)</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-body-md" type="text" defaultValue="2.50" /></div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-white/5"><span className="text-body-md text-on-primary-container">Requires Dimensions</span><SwitchOff /></div>
              <div><label className="block text-[10px] uppercase font-bold text-on-primary-container mb-1">Min Order Qty (MOQ)</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-body-md" type="number" defaultValue={100} /></div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl premium-shadow p-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container">visibility</span> Display</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div><p className="text-body-md font-bold">Auto-calculate &quot;From ₹X&quot;</p><p className="text-[11px] text-on-surface-variant">Recommended based on lowest tier</p></div>
                <SwitchOn />
              </div>
              <div className="p-4 border-2 border-dashed border-outline-variant/30 rounded-lg bg-surface opacity-50">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Manual Override</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline-variant/30 bg-surface-container-low text-on-surface-variant text-body-md">₹</span>
                  <input className="flex-1 min-w-0 w-full bg-surface-container-low border border-outline-variant/30 rounded-r-lg p-3 text-body-md" disabled placeholder="Enter custom starting price" type="text" />
                </div>
              </div>
            </div>
          </section>

          <div className="primary-accent-gradient rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4"><p className="font-label-caps text-label-caps uppercase opacity-80">Market Analytics</p><span className="material-symbols-outlined">trending_up</span></div>
            <div className="space-y-4">
              <div><h4 className="text-[32px] font-extrabold leading-none">₹24,500</h4><p className="text-[10px] uppercase tracking-wider opacity-70">Sales this month</p></div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden"><div className="bg-white h-full" style={{ width: "70%" }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-surface border-t border-outline-variant px-4 md:px-margin-desktop py-4 flex items-center justify-end gap-4">
        <Link href="/admin/products" className="px-6 py-3 rounded-lg border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</Link>
        <button className="px-6 py-3 rounded-lg bg-white border border-outline-variant font-button text-on-surface hover:bg-surface-container transition-colors">Save</button>
        <Link href="/admin/spec-config" className="px-6 py-3 rounded-lg primary-accent-gradient text-white font-button shadow-lg shadow-secondary/20">Save &amp; Configure Specs</Link>
      </div>
    </>
  );
}

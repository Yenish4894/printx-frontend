import type { Metadata } from "next";

export const metadata: Metadata = { title: "PrintX Admin | Settings" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;
const inp = "w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium";

const Switch = () => (
  <button className="w-12 h-6 bg-secondary-container rounded-full relative transition-colors">
    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
  </button>
);

function CardHead({ icon, title, fill = false }: { icon: string; title: string; fill?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
        <span className="material-symbols-outlined" style={fill ? fill1 : undefined}>{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md">{title}</h3>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Settings</h1>
          <p className="font-body-md text-on-surface-variant">Global configuration that drives pricing and policies.</p>
        </div>
        <button className="primary-accent-gradient text-white px-6 py-3 rounded-xl font-button shadow-lg shadow-secondary/20 flex items-center gap-2"><span className="material-symbols-outlined">save</span> Save Changes</button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pricing & Tax */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="receipt_long" title="Pricing & Tax" />
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">GST Percentage (%)</label><input className={inp} type="number" defaultValue={18} /></div>
            <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Wallet Discount (%)</label><input className={inp} type="number" defaultValue={8} /></div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Free Shipping Threshold</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span><input className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-outline-variant font-medium" type="number" defaultValue={999} /></div>
            </div>
            <div className="flex items-center justify-between pt-2"><span className="font-body-md font-medium">Auto-Round Prices</span><Switch /></div>
          </div>
        </section>

        {/* Wallet & Bonus */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="account_balance_wallet" title="Wallet & Bonus" fill />
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Signup Credit</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span><input className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-outline-variant font-medium" type="number" defaultValue={50} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Min Top-up</label><input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="number" defaultValue={200} /></div>
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Max Top-up</label><input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="number" defaultValue={50000} /></div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg">
              <label className="font-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Active Bonus Tiers</label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold bg-white p-2 rounded border border-outline-variant/20"><span>₹1,000+</span><span className="text-secondary">+5% Extra</span></div>
                <div className="flex justify-between text-xs font-bold bg-white p-2 rounded border border-outline-variant/20"><span>₹5,000+</span><span className="text-secondary">+10% Extra</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="stars" title="Loyalty Rewards" />
          <div className="space-y-4">
            {[["workspace_premium text-slate-400", "Silver Tier", "₹10k Spend", false], ["workspace_premium text-amber-500", "Gold Tier", "₹50k Spend", true], ["workspace_premium text-cyan-600", "Platinum", "₹200k Spend", false]].map(([icon, name, spend, active]) => (
              <div key={name as string} className={`flex items-center justify-between p-3 rounded-lg border ${active ? "border-secondary-container/40 bg-secondary-container/5" : "border-outline-variant/30"}`}>
                <div className="flex items-center gap-2"><span className={`material-symbols-outlined ${(icon as string).split(" ")[1]}`}>workspace_premium</span><span className="font-bold">{name as string}</span></div>
                <span className="text-sm font-medium text-on-surface-variant">{spend as string}</span>
              </div>
            ))}
            <div className="pt-2">
              <label className="font-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Points Multiplier</label>
              <input className="w-full accent-secondary" max={5} min={1} step={0.5} type="range" defaultValue={1.5} />
              <div className="flex justify-between text-xs text-on-surface-variant font-bold mt-1"><span>1x (Base)</span><span>1.5x Earn Rate</span><span>5x (Promo)</span></div>
            </div>
          </div>
        </section>

        {/* Order Policy */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl premium-shadow p-8 border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <CardHead icon="policy" title="Order & Technical Policy" />
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full"><span className="material-symbols-outlined text-secondary scale-75">verified</span><span className="text-xs font-bold text-on-surface">Standard Printing Rules Active</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Cancellation Window (Hours)</label><input className={inp} type="number" defaultValue={2} /><p className="text-[10px] text-on-surface-variant">Time after which printing starts and refund is ineligible.</p></div>
              <div className="p-4 bg-background rounded-lg flex items-center justify-between border border-outline-variant/20"><div><h4 className="font-bold text-sm">File Upload Grace Period</h4><p className="text-xs text-on-surface-variant">Allow customers 24h to update files post-payment.</p></div><Switch /></div>
            </div>
            <div className="space-y-4">
              <h4 className="font-label-caps text-on-surface-variant uppercase tracking-wider">Default File Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <select className="rounded-lg border border-outline-variant text-sm font-medium p-2.5"><option>300 DPI</option><option>600 DPI</option><option>Vector Only</option></select>
                <select className="rounded-lg border border-outline-variant text-sm font-medium p-2.5"><option>CMYK (U.S. Web Coated)</option><option>RGB (Screen)</option><option>Grayscale</option></select>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold">Standard Bleed (mm)</label><input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant text-sm" step={0.5} type="number" defaultValue={3.0} /></div>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="local_shipping" title="Delivery" />
          <div className="space-y-4">
            <div className="overflow-hidden border border-outline-variant/30 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low font-label-caps uppercase text-[10px] text-on-surface-variant"><tr><th className="px-4 py-2">Speed</th><th className="px-4 py-2">Fee</th></tr></thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr><td className="px-4 py-3 font-medium">Standard (4-5 days)</td><td className="px-4 py-3 font-bold text-secondary">₹49</td></tr>
                  <tr><td className="px-4 py-3 font-medium">Express (1-2 days)</td><td className="px-4 py-3 font-bold text-secondary">₹149</td></tr>
                </tbody>
              </table>
            </div>
            <div className="pt-2">
              <label className="font-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Active Partners</label>
              <div className="flex flex-wrap gap-2">
                {["BlueDart", "Delhivery", "XpressBees"].map((p) => <span key={p} className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold border border-outline-variant/30">{p}</span>)}
                <button className="px-3 py-1 bg-secondary-container/10 text-secondary rounded-full text-xs font-bold border border-secondary-container/20 hover:bg-secondary-container/20">+ Add</button>
              </div>
            </div>
          </div>
        </section>

        {/* Branding */}
        <section className="col-span-12 bg-surface-container-lowest rounded-xl premium-shadow p-8 border border-outline-variant/10">
          <CardHead icon="business" title="Branding & Corporate Identity" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div>
                <label className="font-label-caps text-on-surface-variant uppercase tracking-wider mb-4 block">Store Logo</label>
                <div className="w-full h-40 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 hover:border-secondary transition-colors cursor-pointer group"><span className="material-symbols-outlined text-4xl text-outline-variant group-hover:text-secondary">cloud_upload</span><p className="text-xs font-medium text-on-surface-variant">SVG, PNG or WEBP (Max 2MB)</p></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Business GST Number</label><input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-mono text-sm tracking-widest bg-surface" type="text" defaultValue="07AAAAA0000A1Z5" /></div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Support Phone</label><input className={inp} type="text" defaultValue="1800-PRINT-X" /></div>
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Support Email</label><input className={inp} type="email" defaultValue="support@printx.in" /></div>
              <div className="flex flex-col gap-1.5"><label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Business Hours</label><input className={inp} type="text" defaultValue="Mon–Sat, 9AM–7PM" /></div>
            </div>
            <div className="space-y-4">
              <label className="font-label-caps text-on-surface-variant uppercase tracking-wider">Social Links</label>
              {["Facebook", "Instagram", "Twitter / X", "LinkedIn"].map((s) => (
                <input key={s} className={inp} type="text" placeholder={`${s} URL`} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

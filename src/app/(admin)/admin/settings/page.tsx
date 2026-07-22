"use client";

import { useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;
const inp = "w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium";

const DPI_OPTIONS = ["300 DPI", "600 DPI", "Vector Only"];
const COLOR_OPTIONS = ["CMYK (U.S. Web Coated)", "RGB (Screen)", "Grayscale"];

const numVal = (n: number) => (Number.isNaN(n) ? "" : n);
/** Ensure the stored value is selectable even if it isn't one of the presets. */
const withStored = (options: string[], stored: string) =>
  stored && !options.includes(stored) ? [stored, ...options] : options;

interface Settings {
  gstPercent: number;
  freeShippingThreshold: number;
  autoRoundPrices: boolean;
  minTopUp: number;
  maxTopUp: number;
  cancellationWindowHours: number;
  fileGracePeriod: boolean;
  defaultDpi: string;
  defaultColorProfile: string;
  standardBleedMm: number;
  businessGstNumber: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
}

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

function validate(s: Settings): Record<string, string> {
  const e: Record<string, string> = {};
  const nonNeg = (v: number) => Number.isFinite(v) && v >= 0;
  if (!Number.isFinite(s.gstPercent) || s.gstPercent < 0 || s.gstPercent > 100)
    e.gstPercent = "GST must be between 0 and 100.";
  if (!nonNeg(s.freeShippingThreshold)) e.freeShippingThreshold = "Must be 0 or more.";
  if (!nonNeg(s.minTopUp)) e.minTopUp = "Must be 0 or more.";
  if (!nonNeg(s.maxTopUp)) e.maxTopUp = "Must be 0 or more.";
  if (nonNeg(s.minTopUp) && nonNeg(s.maxTopUp) && s.minTopUp > s.maxTopUp)
    e.maxTopUp = "Max top-up must be greater than or equal to min.";
  if (!nonNeg(s.cancellationWindowHours)) e.cancellationWindowHours = "Must be 0 or more.";
  if (!nonNeg(s.standardBleedMm)) e.standardBleedMm = "Must be 0 or more.";
  return e;
}

export default function AdminSettings() {
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [initial, setInitial] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    admin.settings
      .get()
      .then((r) => {
        setS(r.settings as Settings);
        setInitial(r.settings as Settings);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load settings"));
  }, []);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));
  }
  const numSet = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    set(k, (raw === "" ? NaN : Number(raw)) as never);
  };
  const strSet = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, e.target.value as never);

  const errors = s ? validate(s) : {};
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = !!s && !!initial && JSON.stringify(s) !== JSON.stringify(initial);

  async function save() {
    if (!s || hasErrors || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const r = await admin.settings.update(s as unknown as Record<string, unknown>);
      setS(r.settings as Settings);
      setInitial(r.settings as Settings);
      toast("Settings saved", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not save settings";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!s) {
    return (
      <div className="py-24 text-center text-on-surface-variant">
        {error ? <p className="text-error">{error}</p> : <span className="material-symbols-outlined animate-spin text-4xl" aria-hidden="true">progress_activity</span>}
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? <p className="text-error text-[11px] mt-1" role="alert">{errors[k]}</p> : null;

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Settings</h1>
          <p className="font-body-md text-on-surface-variant">Global configuration that drives pricing and policies.</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && !hasErrors && <span className="text-amber-600 font-button flex items-center gap-1" role="status"><span className="material-symbols-outlined" aria-hidden="true">edit</span> Unsaved changes</span>}
          {hasErrors && <span className="text-error font-button flex items-center gap-1" role="status"><span className="material-symbols-outlined" aria-hidden="true">error</span> Fix errors to save</span>}
          <button onClick={save} disabled={saving || hasErrors || !dirty} className="primary-accent-gradient text-white px-6 py-3 rounded-xl font-button shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-60"><span className="material-symbols-outlined" aria-hidden="true">save</span> {saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </div>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-error-container/60 text-on-error-container">{error}</div>}

      <div className="grid grid-cols-12 gap-6">
        {/* Pricing & Tax */}
        <section className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="receipt_long" title="Pricing & Tax" />
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gstPercent" className="font-label-caps text-on-surface-variant uppercase tracking-wider">GST Percentage (%)</label>
              <input id="gstPercent" className={inp} type="number" value={numVal(s.gstPercent)} onChange={numSet("gstPercent")} />
              {err("gstPercent")}
              <p className="text-[10px] text-on-surface-variant">Applied live to every quote, cart and invoice.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="freeShippingThreshold" className="font-label-caps text-on-surface-variant uppercase tracking-wider">Free Shipping Threshold</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant" aria-hidden="true">₹</span><input id="freeShippingThreshold" className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-outline-variant font-medium" type="number" value={numVal(s.freeShippingThreshold)} onChange={numSet("freeShippingThreshold")} /></div>
              {err("freeShippingThreshold")}
            </div>
            <div className="flex items-center justify-between pt-2"><span className="font-body-md font-medium">Auto-Round Prices</span><Switch checked={s.autoRoundPrices} onChange={(v) => set("autoRoundPrices", v)} label="Auto-round prices" /></div>
          </div>
        </section>

        {/* Wallet */}
        <section className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="account_balance_wallet" title="Wallet Settings" fill />
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">Orders are paid from the customer&apos;s prepaid wallet. Top-ups are enforced within this range.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label htmlFor="minTopUp" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Min Top-up</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm" aria-hidden="true">₹</span><input id="minTopUp" className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="number" value={numVal(s.minTopUp)} onChange={numSet("minTopUp")} /></div>{err("minTopUp")}</div>
              <div className="flex flex-col gap-1.5"><label htmlFor="maxTopUp" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Max Top-up</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm" aria-hidden="true">₹</span><input id="maxTopUp" className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="number" value={numVal(s.maxTopUp)} onChange={numSet("maxTopUp")} /></div>{err("maxTopUp")}</div>
            </div>
          </div>
        </section>

        {/* Order Policy */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl premium-shadow p-8 border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <CardHead icon="policy" title="Order & Technical Policy" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5"><label htmlFor="cancellationWindowHours" className="font-label-caps text-on-surface-variant uppercase tracking-wider">Cancellation Window (Hours)</label><input id="cancellationWindowHours" className={inp} type="number" value={numVal(s.cancellationWindowHours)} onChange={numSet("cancellationWindowHours")} />{err("cancellationWindowHours")}<p className="text-[10px] text-on-surface-variant">Guidance shown to customers; production-stage orders are non-cancellable.</p></div>
              <div className="p-4 bg-background rounded-lg flex items-center justify-between border border-outline-variant/20"><div><h4 className="font-bold text-sm">File Upload Grace Period</h4><p className="text-xs text-on-surface-variant">Allow customers to update files post-payment.</p></div><Switch checked={s.fileGracePeriod} onChange={(v) => set("fileGracePeriod", v)} label="File upload grace period" /></div>
            </div>
            <div className="space-y-4">
              <h4 className="font-label-caps text-on-surface-variant uppercase tracking-wider">Default File Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="defaultDpi" className="text-xs font-bold">Default DPI</label>
                  <select id="defaultDpi" value={s.defaultDpi} onChange={(e) => set("defaultDpi", e.target.value)} className="rounded-lg border border-outline-variant text-sm font-medium p-2.5">
                    {withStored(DPI_OPTIONS, s.defaultDpi).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="defaultColorProfile" className="text-xs font-bold">Color Profile</label>
                  <select id="defaultColorProfile" value={s.defaultColorProfile} onChange={(e) => set("defaultColorProfile", e.target.value)} className="rounded-lg border border-outline-variant text-sm font-medium p-2.5">
                    {withStored(COLOR_OPTIONS, s.defaultColorProfile).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5"><label htmlFor="standardBleedMm" className="text-xs font-bold">Standard Bleed (mm)</label><input id="standardBleedMm" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant text-sm" step={0.5} type="number" value={numVal(s.standardBleedMm)} onChange={numSet("standardBleedMm")} />{err("standardBleedMm")}</div>
            </div>
          </div>
        </section>

        {/* Delivery note */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="local_shipping" title="Delivery" />
          <p className="text-sm text-on-surface-variant leading-relaxed">Delivery speeds &amp; fees are configured <span className="font-bold text-on-surface">per product</span> in Spec Configuration, so each product can offer its own options and pricing.</p>
        </section>

        {/* Branding */}
        <section className="col-span-12 bg-surface-container-lowest rounded-xl premium-shadow p-8 border border-outline-variant/10">
          <CardHead icon="business" title="Branding & Corporate Identity" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5"><label htmlFor="businessGstNumber" className="font-label-caps text-on-surface-variant uppercase tracking-wider">Business GST Number</label><input id="businessGstNumber" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-mono text-sm tracking-widest bg-surface" type="text" value={s.businessGstNumber ?? ""} onChange={strSet("businessGstNumber")} placeholder="24CHLPB0341K1ZO" /></div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5"><label htmlFor="supportPhone" className="font-label-caps text-on-surface-variant uppercase tracking-wider">Support Phone</label><input id="supportPhone" className={inp} type="text" value={s.supportPhone ?? ""} onChange={strSet("supportPhone")} placeholder="+91 7203000701" /></div>
              <div className="flex flex-col gap-1.5"><label htmlFor="supportEmail" className="font-label-caps text-on-surface-variant uppercase tracking-wider">Support Email</label><input id="supportEmail" className={inp} type="email" value={s.supportEmail ?? ""} onChange={strSet("supportEmail")} placeholder="bhaginigraphics@gmail.com" /></div>
            </div>
            <div className="space-y-4">
              <span className="font-label-caps text-on-surface-variant uppercase tracking-wider">Social Links</span>
              <input aria-label="Facebook URL" className={inp} type="text" value={s.socialFacebook ?? ""} onChange={strSet("socialFacebook")} placeholder="Facebook URL" />
              <input aria-label="Instagram URL" className={inp} type="text" value={s.socialInstagram ?? ""} onChange={strSet("socialInstagram")} placeholder="Instagram URL" />
              <input aria-label="Twitter / X URL" className={inp} type="text" value={s.socialTwitter ?? ""} onChange={strSet("socialTwitter")} placeholder="Twitter / X URL" />
              <input aria-label="LinkedIn URL" className={inp} type="text" value={s.socialLinkedin ?? ""} onChange={strSet("socialLinkedin")} placeholder="LinkedIn URL" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

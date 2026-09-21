"use client";

import { useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useSession } from "@/components/SessionProvider";
import { useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";

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
  // Bank account customers pay into. Flattened from the API's `bank` object so
  // the form can bind to them and save sends the keys settingsSchema expects.
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankUpiId: string;
}

type ApiSettings = Omit<Settings, "bankAccountName" | "bankName" | "bankAccountNumber" | "bankIfsc" | "bankUpiId"> & {
  bank?: { accountName: string | null; bankName: string | null; accountNumber: string | null; ifsc: string | null; upiId: string | null };
};

function fromApi(r: ApiSettings): Settings {
  const { bank, ...rest } = r;
  return {
    ...rest,
    bankAccountName: bank?.accountName ?? "",
    bankName: bank?.bankName ?? "",
    bankAccountNumber: bank?.accountNumber ?? "",
    bankIfsc: bank?.ifsc ?? "",
    bankUpiId: bank?.upiId ?? "",
  };
}

const bankComplete = (s: Settings) =>
  !!(s.bankAccountName.trim() && s.bankAccountNumber.trim() && s.bankIfsc.trim());

function CardHead({ icon, title, fill = false }: { icon: string; title: string; fill?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
        <span aria-hidden="true" className="material-symbols-outlined" style={fill ? fill1 : undefined}>{icon}</span>
      </div>
      <h2 className="font-headline-md text-headline-md">{title}</h2>
    </div>
  );
}

function validate(s: Settings): Record<string, string> {
  const e: Record<string, string> = {};
  const nonNeg = (v: number) => Number.isFinite(v) && v >= 0;
  if (!Number.isFinite(s.gstPercent) || s.gstPercent < 0 || s.gstPercent > 100)
    e.gstPercent = "GST must be between 0 and 100.";
  if (!nonNeg(s.freeShippingThreshold)) e.freeShippingThreshold = "Must be 0 or more.";
  // Same rules the server enforces, shown inline before save. A typo here sends
  // a customer's money to the wrong account, so these are worth being strict about.
  const acct = s.bankAccountNumber.trim();
  if (acct && !/^\d{9,18}$/.test(acct)) e.bankAccountNumber = "Digits only, 9 to 18 long.";
  const ifsc = s.bankIfsc.trim().toUpperCase();
  if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) e.bankIfsc = "Should look like HDFC0001234.";
  const upi = s.bankUpiId.trim();
  if (upi && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) e.bankUpiId = "Should look like name@bank.";
  if (!nonNeg(s.cancellationWindowHours)) e.cancellationWindowHours = "Must be 0 or more.";
  if (!nonNeg(s.standardBleedMm)) e.standardBleedMm = "Must be 0 or more.";
  return e;
}

export default function AdminSettings() {
  const { user } = useSession();
  // The server enforces this too; the page just doesn't offer what would be refused.
  const canEditBank = user?.role === "SUPER_ADMIN";
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [initial, setInitial] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    admin.settings
      .get()
      .then((r) => {
        const f = fromApi(r.settings as ApiSettings);
        setS(f);
        setInitial(f);
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
      const f = fromApi(r.settings as ApiSettings);
      setS(f);
      setInitial(f);
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
          <Button onClick={save} disabled={hasErrors || !dirty} loading={saving} icon="save">{saving ? "Saving…" : "Save changes"}</Button>
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

        {/* Bank details */}
        <section className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
          <CardHead icon="account_balance" title="Bank Details for Payments" fill />
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Customers transfer to this account after placing an order, then upload a screenshot for you to verify.
              Shown only to a customer on their own unpaid order.
            </p>
            {!bankComplete(s) && (
              <p role="alert" className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2.5 text-sm font-bold text-on-error-container">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">warning</span>
                Checkout is blocked until account holder, account number and IFSC are filled in and saved.
              </p>
            )}
            {!canEditBank && (
              <p className="flex items-start gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface-variant">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">lock</span>
                Only a super admin can change the account customers pay into.
              </p>
            )}
            <fieldset disabled={!canEditBank} className="grid grid-cols-1 sm:grid-cols-2 gap-4 disabled:opacity-70">
              <legend className="sr-only">Bank account</legend>
              <div className="flex flex-col gap-1.5"><label htmlFor="bankAccountName" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Account Holder Name</label><input id="bankAccountName" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="text" value={s.bankAccountName} onChange={strSet("bankAccountName")} placeholder="Bhagini Graphics" aria-invalid={errors.bankAccountName ? true : undefined} />{err("bankAccountName")}</div>
              <div className="flex flex-col gap-1.5"><label htmlFor="bankName" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Bank Name</label><input id="bankName" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="text" value={s.bankName} onChange={strSet("bankName")} placeholder="HDFC Bank" aria-invalid={errors.bankName ? true : undefined} />{err("bankName")}</div>
              <div className="flex flex-col gap-1.5"><label htmlFor="bankAccountNumber" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Account Number</label><input id="bankAccountNumber" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm font-mono tracking-wider" type="text" value={s.bankAccountNumber} onChange={strSet("bankAccountNumber")} placeholder="50100123456789" aria-invalid={errors.bankAccountNumber ? true : undefined} />{err("bankAccountNumber")}</div>
              <div className="flex flex-col gap-1.5"><label htmlFor="bankIfsc" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">IFSC</label><input id="bankIfsc" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm font-mono tracking-wider uppercase" type="text" value={s.bankIfsc} onChange={strSet("bankIfsc")} placeholder="HDFC0001234" aria-invalid={errors.bankIfsc ? true : undefined} />{err("bankIfsc")}</div>
              <div className="flex flex-col gap-1.5"><label htmlFor="bankUpiId" className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">UPI ID (optional)</label><input id="bankUpiId" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant font-medium text-sm" type="text" value={s.bankUpiId} onChange={strSet("bankUpiId")} placeholder="bhagini@hdfcbank" aria-invalid={errors.bankUpiId ? true : undefined} />{err("bankUpiId")}</div>
            </fieldset>
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
              <div className="p-4 bg-background rounded-lg flex items-center justify-between border border-outline-variant/20"><div><h3 className="font-bold text-sm">File Upload Grace Period</h3><p className="text-xs text-on-surface-variant">Allow customers to update files post-payment.</p></div><Switch checked={s.fileGracePeriod} onChange={(v) => set("fileGracePeriod", v)} label="File upload grace period" /></div>
            </div>
            <div className="space-y-4">
              <h3 className="font-label-caps text-on-surface-variant uppercase tracking-wider">Default File Requirements</h3>
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

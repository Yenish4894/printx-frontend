"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { auth, ApiError } from "@/lib/api";

const features = [
  ["currency_rupee", "Instant Live Pricing", "Get quotes in seconds, no waiting."],
  ["account_balance_wallet", "Prepaid Wallet", "Add funds once and pay in one click."],
  ["local_shipping", "Express Delivery", "Pan-India shipping within 48h."],
];

const inputCls =
  "w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authTab, setAuthTab] = useState<"signin" | "create">(
    searchParams.get("tab") === "create" ? "create" : "signin"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [f, setF] = useState({
    businessName: "",
    ownerName: "",
    mobile: "",
    email: "",
    gstNumber: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (authTab === "signin") {
        await auth.login(f.mobile.trim(), f.password);
      } else {
        await auth.register({
          businessName: f.businessName.trim(),
          ownerName: f.ownerName.trim(),
          mobile: f.mobile.trim(),
          email: f.email.trim(),
          gstNumber: f.gstNumber.trim() || undefined,
          password: f.password,
        });
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen font-body-md text-on-surface">
      {/* Left Panel: Brand & Marketing */}
      <section className="hidden lg:flex lg:w-7/12 xl:w-8/12 bg-primary-container relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <Link href="/" className="inline-flex" aria-label="Bhagini Graphics — home">
                <BrandLogo textClass="text-headline-md" iconSize={34} />
              </Link>
              <p className="font-label-caps text-[10px] tracking-widest text-on-primary-container mt-1 pl-1">ONLINE PRINTING</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-2xl mt-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-secondary-container font-button text-label-caps mb-8">
            ONLINE PRINTING · PAN-INDIA DELIVERY
          </span>
          <h2 className="font-display-lg text-display-lg mb-6">
            <span className="highlight-bar">Print Smarter.</span>
            <br />
            <span className="highlight-bar">Deliver Faster.</span>
          </h2>
          <p className="font-body-lg text-on-primary-container max-w-lg mb-12">
            Businesses across India trust Bhagini Graphics for high-quality CMYK printing, stickers, and packaging.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(([icon, title, desc]) => (
              <div key={title} className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default group">
                <span aria-hidden="true" className="material-symbols-outlined text-secondary-container mb-3 block group-hover:scale-110 transition-transform">{icon}</span>
                <h3 className="font-button text-body-md text-white mb-1">{title}</h3>
                <p className="text-on-primary-container text-label-caps font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel: Authentication Form */}
      <section className="w-full lg:w-5/12 xl:w-4/12 bg-surface flex flex-col items-center justify-center relative py-10">
        <div className="w-full max-w-md px-margin-mobile md:px-gutter">
          {/* Tab Toggle */}
          <div className="mb-10">
            <div className="flex p-1 bg-surface-container rounded-xl">
              <button
                onClick={() => setAuthTab("signin")}
                className={`flex-1 py-2.5 rounded-lg font-button text-body-md transition-all ${authTab === "signin" ? "coral-gradient text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab("create")}
                className={`flex-1 py-2.5 rounded-lg font-button text-body-md transition-all ${authTab === "create" ? "coral-gradient text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {authTab === "signin" ? "Welcome back!" : "Create your account"}
            </h2>
            <p className="text-on-surface-variant font-body-md">
              {authTab === "signin"
                ? "Enter your credentials to access your workspace."
                : "Sign up to start ordering with live pricing."}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            {authTab === "create" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-on-surface-variant" htmlFor="business">BUSINESS NAME</label>
                    <div className="relative group">
                      <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">storefront</span>
                      <input className={inputCls} id="business" placeholder="Bhagini Graphics" type="text" autoComplete="organization" value={f.businessName} onChange={set("businessName")} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-on-surface-variant" htmlFor="owner">OWNER NAME</label>
                    <div className="relative group">
                      <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">person</span>
                      <input className={inputCls} id="owner" placeholder="Owner full name" type="text" autoComplete="name" value={f.ownerName} onChange={set("ownerName")} required />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="mobile">MOBILE NUMBER</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-body-md">+91</span>
                    <input className="w-full pl-14 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="mobile" placeholder="98765 43210" maxLength={10} inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="tel" type="tel" value={f.mobile} onChange={set("mobile")} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="email">EMAIL ADDRESS</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">alternate_email</span>
                    <input className={inputCls} id="email" placeholder="business@email.com" type="email" autoComplete="email" value={f.email} onChange={set("email")} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="gst">GST NUMBER</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">receipt_long</span>
                    <input className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-mono tracking-wider uppercase text-on-surface" id="gst" placeholder="24CHLPB0341K1ZO" maxLength={15} pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{1}[Zz]{1}[0-9A-Za-z]{1}" title="Enter a valid 15-character GSTIN, e.g. 24CHLPB0341K1ZO" type="text" value={f.gstNumber} onChange={set("gstNumber")} />
                  </div>
                  <p className="font-label-caps text-on-surface-variant/80 text-[11px]">Optional · 15-character GSTIN, e.g. 24CHLPB0341K1ZO</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="new-password">PASSWORD</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="new-password" placeholder="Create a password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={f.password} onChange={set("password")} required minLength={8} />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 min-w-9 min-h-9 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" onClick={() => setShowPassword((s) => !s)} type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                      <span aria-hidden="true" className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="mobile">MOBILE NUMBER</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-body-md">+91</span>
                    <input className="w-full pl-14 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="mobile" placeholder="98765 43210" maxLength={10} inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="username" type="tel" value={f.mobile} onChange={set("mobile")} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="password">PASSWORD</label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} autoComplete="current-password" value={f.password} onChange={set("password")} required />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 min-w-9 min-h-9 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" onClick={() => setShowPassword((s) => !s)} type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                      <span aria-hidden="true" className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

              </>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-error-container/60 text-on-error-container text-body-md">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="w-full py-4 rounded-xl coral-gradient text-white font-button text-body-md shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              type="submit"
              disabled={busy}
            >
              {busy ? "Please wait…" : authTab === "signin" ? "Sign In to Bhagini Graphics" : "Create Account"}
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {authTab === "create" && (
              <p className="text-center text-label-caps text-on-surface-variant">
                By creating an account you agree to Bhagini Graphics&apos;s Terms &amp; Privacy Policy.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

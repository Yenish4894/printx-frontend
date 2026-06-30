"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

const features = [
  ["currency_rupee", "Instant Live Pricing", "Get quotes in seconds, no waiting."],
  ["account_balance_wallet", "Prepaid Wallet", "Add funds once and pay in one click."],
  ["local_shipping", "Express Delivery", "Pan-India shipping within 48h."],
];

const inputCls =
  "w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface";

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"signin" | "create">("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen font-body-md text-on-surface">
      {/* Left Panel: Brand & Marketing */}
      <section className="hidden lg:flex lg:w-7/12 xl:w-8/12 bg-primary-container relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div
            className="w-full h-full bg-cover"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSxnmDVW-hn0r9pgWRbilyqO-tlSIE2IIeEMCvz_9cA94b1WXBEe2cbdbdgB4WBTOtzjbXb_Bc6LV_LX55A7jVxHEL-b9a-MgWFFJDCR0r_q_jeMZ5ysR1quc2wXDAdBW82nyCVKPTUCzsRzRCwVrgS6CqyEMeVhjgC9n5rDNWdFw5SsKpULODWW4_wsC4AEQWsmn8UFLLfb-q6qLEOS343-P1S35IH-I2jfGICF2uEIpI4xV5d2KBXhDH_cdgXVp8lmiOY_mqbLk')",
            }}
          ></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <BrandLogo textClass="text-headline-md" iconSize={34} />
              <p className="font-label-caps text-[10px] tracking-widest text-on-primary-container mt-1 pl-1">ONLINE PRINTING</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-2xl mt-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-secondary-container font-button text-label-caps mb-8">
            INDIA&apos;S FASTEST ONLINE PRINTING PLATFORM
          </span>
          <h2 className="font-display-lg text-display-lg mb-6">
            <span className="highlight-bar">Print Smarter.</span>
            <br />
            <span className="highlight-bar">Deliver Faster.</span>
          </h2>
          <p className="font-body-lg text-on-primary-container max-w-lg mb-12">
            Join 12,000+ businesses and creative professionals who trust Bhagini Graphics for their high-end printing needs.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {features.map(([icon, title, desc]) => (
              <div key={title} className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default group">
                <span className="material-symbols-outlined text-secondary-container mb-3 block group-hover:scale-110 transition-transform">{icon}</span>
                <h3 className="font-button text-body-md text-white mb-1">{title}</h3>
                <p className="text-on-primary-container text-label-caps font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-12 pt-12 border-t border-white/10">
          {[["50K+", "ORDERS"], ["12K+", "HAPPY CUSTOMERS"]].map(([v, l]) => (
            <div key={l}>
              <p className="font-display-lg text-headline-md text-white">{v}</p>
              <p className="font-label-caps text-on-primary-container">{l}</p>
            </div>
          ))}
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
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/dashboard");
            }}
          >
            {authTab === "create" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-on-surface-variant" htmlFor="business">BUSINESS NAME</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">storefront</span>
                      <input className={inputCls} id="business" placeholder="Bhagini Graphics" type="text" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-on-surface-variant" htmlFor="owner">OWNER NAME</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">person</span>
                      <input className={inputCls} id="owner" placeholder="Owner full name" type="text" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="mobile">MOBILE NUMBER</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-body-md">+91</span>
                    <input className="w-full pl-14 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="mobile" placeholder="98765 43210" maxLength={10} inputMode="numeric" type="tel" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="email">EMAIL ADDRESS</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">alternate_email</span>
                    <input className={inputCls} id="email" placeholder="business@email.com" type="email" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="gst">GST NUMBER</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">receipt_long</span>
                    <input className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-mono tracking-wider uppercase text-on-surface" id="gst" placeholder="24CHLPB0341K1ZO" maxLength={15} type="text" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="address">BUSINESS ADDRESS</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant group-focus-within:text-secondary transition-colors">location_on</span>
                    <textarea className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface resize-none" id="address" placeholder="Shop / building, area, city, state, PIN code" rows={2}></textarea>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="new-password">PASSWORD</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="new-password" placeholder="Create a password" type={showPassword ? "text" : "password"} />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors" onClick={() => setShowPassword((s) => !s)} type="button">
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="mobile">MOBILE NUMBER</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-body-md">+91</span>
                    <input className="w-full pl-14 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="mobile" placeholder="98765 43210" maxLength={10} inputMode="numeric" type="tel" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-caps text-on-surface-variant" htmlFor="password">PASSWORD</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors" onClick={() => setShowPassword((s) => !s)} type="button">
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20 cursor-pointer" type="checkbox" />
                    <span className="text-label-caps text-on-surface-variant group-hover:text-on-surface transition-colors">REMEMBER ME</span>
                  </label>
                  <a className="text-label-caps text-secondary font-bold hover:underline" href="#">FORGOT PASSWORD?</a>
                </div>
              </>
            )}

            <button className="w-full py-4 rounded-xl coral-gradient text-white font-button text-body-md shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
              {authTab === "signin" ? "Sign In to Bhagini Graphics" : "Create Account"}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
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

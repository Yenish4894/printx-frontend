"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const features = [
  ["currency_rupee", "Instant Live Pricing", "Get quotes in seconds, no waiting."],
  ["account_balance_wallet", "Prepaid Wallet Savings", "Add funds & get up to 10% bonus."],
  ["local_shipping", "Express Delivery", "Pan-India shipping within 48h."],
  ["verified", "100% Reprint Guarantee", "Quality issues? We'll reprint it for free."],
];

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"signin" | "create">("signin");
  const [method, setMethod] = useState<"email" | "mobile">("email");
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
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={fill1}>print</span>
            </div>
            <div>
              <h1 className="font-display-lg text-headline-md tracking-tight leading-none">PrintX</h1>
              <p className="font-label-caps text-[10px] tracking-widest text-on-primary-container">ONLINE PRINTING</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-2xl mt-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-secondary-container font-button text-label-caps mb-8">
            INDIA'S FASTEST ONLINE PRINTING PLATFORM
          </span>
          <h2 className="font-display-lg text-display-lg mb-6">
            <span className="highlight-bar">Print Smarter.</span>
            <br />
            <span className="highlight-bar">Pay Less.</span>
          </h2>
          <p className="font-body-lg text-on-primary-container max-w-lg mb-12">
            Join 12,000+ businesses and creative professionals who trust PrintX for their high-end printing needs.
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
          {[["50K+", "ORDERS"], ["12K+", "HAPPY CUSTOMERS"], ["4.9★", "RATED"]].map(([v, l]) => (
            <div key={l}>
              <p className="font-display-lg text-headline-md text-white">{v}</p>
              <p className="font-label-caps text-on-primary-container">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Right Panel: Authentication Form */}
      <section className="w-full lg:w-5/12 xl:w-4/12 bg-surface flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md px-margin-mobile md:px-gutter">
          {/* Toggle Groups */}
          <div className="mb-10 space-y-6">
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
            <div className="flex gap-6 border-b border-outline-variant">
              <button
                onClick={() => setMethod("email")}
                className={`pb-3 px-1 font-button text-label-caps relative ${method === "email" ? "text-secondary border-b-2 border-secondary" : "text-on-surface-variant hover:text-on-surface transition-colors"}`}
              >
                EMAIL
              </button>
              <button
                onClick={() => setMethod("mobile")}
                className={`pb-3 px-1 font-button text-label-caps ${method === "mobile" ? "text-secondary border-b-2 border-secondary" : "text-on-surface-variant hover:text-on-surface transition-colors"}`}
              >
                MOBILE (OTP)
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
                : "Sign up to start ordering with live pricing & wallet savings."}
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
            {authTab === "create" && (
              <div className="space-y-1.5">
                <label className="font-label-caps text-on-surface-variant">FULL NAME</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">person</span>
                  <input className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" placeholder="Priya Mehta" type="text" />
                </div>
              </div>
            )}

            {method === "email" ? (
              <div className="space-y-1.5">
                <label className="font-label-caps text-on-surface-variant" htmlFor="email">EMAIL ADDRESS</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">alternate_email</span>
                  <input className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="email" placeholder="john@example.com" type="email" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-label-caps text-on-surface-variant" htmlFor="mobile">MOBILE NUMBER</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">smartphone</span>
                  <input className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface" id="mobile" placeholder="+91 98765 43210" type="tel" />
                </div>
              </div>
            )}

            {method === "email" && (
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
            )}

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20 cursor-pointer" type="checkbox" />
                <span className="text-label-caps text-on-surface-variant group-hover:text-on-surface transition-colors">REMEMBER ME</span>
              </label>
              <a className="text-label-caps text-secondary font-bold hover:underline" href="#">FORGOT PASSWORD?</a>
            </div>

            <button className="w-full py-4 rounded-xl coral-gradient text-white font-button text-body-md shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
              {authTab === "signin" ? "Sign In to PrintX" : "Create Account"}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-outline-variant flex-1"></div>
            <span className="font-label-caps text-on-surface-variant">OR CONTINUE WITH</span>
            <div className="h-px bg-outline-variant flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => router.push("/dashboard")} className="flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl font-button text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button type="button" onClick={() => router.push("/dashboard")} className="flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl font-button text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        {/* Bottom Offer Banner */}
        <div className="absolute bottom-0 left-0 w-full bg-primary-container py-4 px-gutter flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-secondary-container" style={fill1}>redeem</span>
          <p className="font-button text-label-caps text-secondary-container tracking-wider text-center">
            NEW USER OFFER: GET ₹50 FREE WALLET CREDIT ON YOUR FIRST ORDER. NO MINIMUM SPEND.
          </p>
        </div>
      </section>
    </main>
  );
}

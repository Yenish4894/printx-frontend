"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="font-body-md text-on-surface bg-primary-container min-h-screen flex items-center justify-center p-6 admin-canvas-gradient relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-fixed-dim rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-float">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 coral-gradient rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={fill1}>print</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-white tracking-tighter">Print<span className="text-secondary-container">X</span></h1>
          </div>
          <div className="h-0.5 w-12 coral-gradient rounded-full"></div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-2xl p-10 border border-white/10">
          <div className="text-center mb-10">
            <h2 className="font-headline-md text-headline-md text-on-primary-fixed mb-2">Admin Portal</h2>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-[10px]">Authorized Personnel Only</p>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push("/admin"); }}>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary-container transition-colors">mail</span>
                <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md input-focus-ring transition-all" id="email" placeholder="admin@printx.in" required type="email" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-caps text-on-surface-variant" htmlFor="password">Security Password</label>
                <a className="text-[11px] font-semibold text-secondary hover:text-secondary-container transition-colors uppercase tracking-wider" href="#">Forgot?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary-container transition-colors">lock</span>
                <input className="w-full pl-10 pr-12 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md input-focus-ring transition-all" id="password" placeholder="••••••••" required type={showPassword ? "text" : "password"} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors" type="button" onClick={() => setShowPassword((s) => !s)}>
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary" id="remember" type="checkbox" />
              <label className="ml-2 text-sm text-on-surface-variant font-medium" htmlFor="remember">Keep me signed in on this station</label>
            </div>
            <button className="w-full py-4 coral-gradient text-white font-button text-button rounded-lg shadow-[0_4px_20px_rgba(252,83,109,0.3)] hover:shadow-[0_6px_25px_rgba(252,83,109,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
              <span>Sign In to Console</span>
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          </form>
          <div className="mt-10 pt-6 border-t border-outline-variant/30 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
              <span className="material-symbols-outlined text-[14px] text-on-tertiary-container" style={fill1}>verified_user</span>
              <span className="text-[11px] font-semibold text-on-tertiary-container uppercase tracking-tight">End-to-End Encrypted Session</span>
            </div>
            <p className="text-[10px] text-outline text-center leading-relaxed max-w-[280px]">Access is logged for auditing purposes. Unauthorized attempts will be reported to system administration.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-white/40 font-label-caps text-[10px]">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div><span>Server v2.4.1</span></div>
          <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">public</span><span>Global Node 04</span></div>
        </div>
      </div>
    </main>
  );
}

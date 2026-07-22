"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { auth, ApiError } from "@/lib/api";


export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { user } = await auth.login(mobile.trim(), password);
      if (user.role === "CUSTOMER") {
        setError("This account does not have admin access.");
        await auth.logout();
        setBusy(false);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="font-body-md text-on-surface bg-primary-container min-h-screen flex items-center justify-center p-6 admin-canvas-gradient relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-fixed-dim rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="inline-flex" aria-label="Bhagini Graphics — home">
              <BrandLogo textClass="text-headline-lg" iconSize={40} />
            </Link>
          </div>
          <div className="h-0.5 w-12 coral-gradient rounded-full"></div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-2xl p-10 border border-white/10">
          <div className="text-center mb-10">
            <h2 className="font-headline-md text-headline-md text-on-primary-fixed mb-2">Admin Portal</h2>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-[10px]">Authorized Personnel Only</p>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2" htmlFor="mobile">Mobile Number</label>
              <div className="relative group">
                <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary-container transition-colors">call</span>
                <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md input-focus-ring transition-all" id="mobile" placeholder="90000 00000" maxLength={10} inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="username" required type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2" htmlFor="password">Password</label>
              <div className="relative group">
                <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary-container transition-colors">lock</span>
                <input className="w-full pl-10 pr-12 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md input-focus-ring transition-all" id="password" placeholder="••••••••" required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 min-w-9 min-h-9 flex items-center justify-center text-outline-variant hover:text-on-surface-variant transition-colors" type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  <span aria-hidden="true" className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-lg bg-error-container/60 text-on-error-container text-body-md">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}
            <button className="w-full py-4 coral-gradient text-white font-button text-button rounded-lg shadow-[0_4px_20px_rgba(252,83,109,0.3)] hover:shadow-[0_6px_25px_rgba(252,83,109,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none" type="submit" disabled={busy}>
              <span>{busy ? "Signing in…" : "Sign In to Console"}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-lg">login</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

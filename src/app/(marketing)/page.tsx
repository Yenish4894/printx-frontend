import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingCatalog from "@/components/marketing/MarketingCatalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Bhagini Graphics | Online Printing in India",
};

const PHONE = "+91 72030 00701";
const EMAIL = "bhaginigraphics@gmail.com";
const GSTIN = "24CHLPB0341K1ZO";

export default function LandingPage() {
  return (
    <>
      {/* Utility strip */}
      <div className="bg-primary-container text-on-primary-container py-2 border-b border-white/5">
        <div className="max-w-container-max mx-auto px-gutter flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-1 items-center font-label-caps text-label-caps">
          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">call</span> {PHONE}
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">mail</span> {EMAIL}
          </a>
        </div>
      </div>

      <MarketingNav />

      {/* Hero */}
      <section id="home" className="hero-gradient relative overflow-hidden py-24 md:py-28 scroll-mt-24">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="font-label-caps text-label-caps tracking-wider uppercase text-on-primary-container">
                CMYK Printing · Stickers · Offset
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg mb-6 leading-[1.1]">
              Print Smarter.
              <br />
              Deliver Faster.
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container mb-10 max-w-lg">
              Configure any job, see the exact GST-inclusive price instantly, pay from your prepaid
              wallet, and track it to delivery — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="primary-gradient text-white px-8 py-4 rounded-xl font-button text-button shadow-lg flex items-center justify-center gap-2 group">
                Get Started
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link href="/products" className="border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-button text-button transition-colors text-center">
                Browse Products
              </Link>
            </div>
          </div>

          {/* Honest example price card (illustrative — real pricing after login) */}
          <div id="pricing" className="relative scroll-mt-24">
            <div className="bg-white rounded-xl p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-headline-md text-primary">Example quote</h3>
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">Illustrative</span>
              </div>
              <div className="space-y-4">
                {[
                  ["Product", "CMYK Printing"],
                  ["Size", "12 × 18 inch"],
                  ["Paper", "100 GSM · Single side"],
                  ["Quantity", "250 sheets"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">{k}</span>
                    <span className="font-semibold text-on-surface">{v}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-outline-variant flex justify-between items-end">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Total (GST incl.)</p>
                    <p className="font-display-lg text-display-lg text-primary">₹2,000</p>
                  </div>
                  <Link href="/products/cmyk-printing" className="primary-gradient text-white px-6 py-3 rounded-xl font-button text-button shadow-lg">
                    Try it live
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <div className="bg-surface py-10 border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter overflow-x-auto no-scrollbar">
          <div className="flex justify-between items-center gap-12 min-w-max">
            {[
              ["calculate", "INSTANT GST-INCLUSIVE QUOTES"],
              ["account_balance_wallet", "PREPAID WALLET"],
              ["local_shipping", "PAN-INDIA DELIVERY"],
              ["orders", "ORDER TRACKING"],
            ].map(([icon, label]) => (
              <div className="flex items-center gap-3 text-on-surface-variant" key={label}>
                <span aria-hidden="true" className="material-symbols-outlined text-secondary-container">{icon}</span>
                <span className="font-label-caps text-label-caps font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real catalogue */}
      <section id="services" className="py-24 bg-surface-container-low scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex justify-between items-end mb-14">
            <div>
              <p className="font-label-caps text-label-caps text-secondary font-extrabold uppercase tracking-[0.2em] mb-3">Our Catalogue</p>
              <h2 className="font-display-lg text-headline-lg md:text-display-lg text-primary">What we print</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 font-button text-button text-primary hover:text-secondary transition-colors">
              View all products <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
          <MarketingCatalog />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-primary py-24 text-white scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-display-lg mb-4">How it works</h2>
            <p className="font-body-lg text-on-primary-container max-w-2xl mx-auto">
              From configuration to delivery in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              ["01", "Create your account", "Sign up with your business details and access your dashboard and wallet."],
              ["02", "Configure & price", "Pick your specifications and see the exact GST-inclusive price instantly."],
              ["03", "Pay from wallet", "Top up once and pay for orders in a single click."],
              ["04", "Track & receive", "Follow each order's status right through to delivery."],
            ].map(([num, title, desc]) => (
              <div className="flex flex-col items-center text-center" key={num}>
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <span className="font-display-lg text-headline-lg text-white">{num}</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">{title}</h3>
                <p className="text-on-primary-container font-body-md">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary-container py-24">
        <div className="max-w-container-max mx-auto px-gutter text-center">
          <h2 className="font-display-lg text-display-lg text-white mb-6">Ready to place your first order?</h2>
          <p className="text-on-primary-container font-body-lg mb-12 max-w-xl mx-auto">
            Create an account and get an instant quote on your next print job.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login?tab=create" className="primary-gradient text-white px-10 py-4 rounded-xl font-button text-button shadow-lg active:scale-95 transition-transform">
              Create account
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-xl font-button text-button transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — real info only */}
      <footer id="contact" className="bg-primary-container text-white py-14 border-t border-white/5 scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div className="space-y-5">
            <Link href="/" className="inline-flex" aria-label="Bhagini Graphics — home">
              <BrandLogo textClass="text-headline-md" iconSize={30} />
            </Link>
            <p className="text-on-primary-container text-sm leading-relaxed max-w-sm">
              Online printing for businesses across India — CMYK, stickers and offset jobs with
              instant pricing and prepaid-wallet checkout.
            </p>
          </div>
          <div>
            <h4 className="font-button text-white mb-5">Explore</h4>
            <ul className="space-y-3 text-on-primary-container text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
              <li><Link href="/login?tab=create" className="hover:text-white transition-colors">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-button text-white mb-5">Contact</h4>
            <ul className="space-y-3 text-on-primary-container text-sm">
              <li><a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">call</span>{PHONE}</a></li>
              <li><a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-white transition-colors"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">mail</span>{EMAIL}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-gutter pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-on-primary-container text-[12px]">
          <span>© 2026 Bhagini Graphics. All rights reserved.</span>
          <span>GSTIN: {GSTIN}</span>
        </div>
      </footer>
    </>
  );
}

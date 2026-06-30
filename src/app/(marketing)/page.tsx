import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Bhagini Graphics | India's Fastest Online Printing Platform",
};

const products = [
  {
    name: "Business Cards",
    price: "₹249",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX4_7-14r-Hz5TxJFkUQMX3wqjYU1Ab9y98XBiYWox1YQNXSsEBmbbOStDKIaKTHfDMD2dRFq506rzF-RqSVLYvKlpFPV61p-G_Dpt1m2A9u-GTeb64aawyuUAcI6lxnpLghB_Gf4y3RAjdxcFL5Px5bphHcq_VYztE2ZOU16rzXvbTw7gpDeeUCbBYew7h7ewfMJ9VZ3_G9AFLmJP52DzVnRWiAmgvntZJeuwJPigqzFJq_jattDTH7qxIYNRjcJJiuggmkL_BIs",
  },
  {
    name: "Brochures & Flyers",
    price: "₹599",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2P0iCJTrBuWi1M0KCehRnlc--tlvw8UZwJ7FHOaxmsY72md1mYuEmse_hF0memPpqFRpICTtM-4EOmWPjqaBtG939cT_Z-j802G3feTRf3OZU5iD1SuXdD323dfJc_OiTnf9oswi5mhkiNb0QQ5npBTqBHkrC2faP6mnucEBjm29l_347qiIRPzZ3k7vq1omZrRUjmxVyQ37XqVOcihK_pupbQ9bdlZPGeGFgqa6ZM1WnmdOOiJNbnUOa4IpxUJcNzVCryuJ6Hiw",
  },
  {
    name: "Catalogues & Books",
    price: "₹1,849",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1XSalwhJpC-mKyxYX_6A2v0zjpEVt93FS9eNtEFJt0hPp2kVyosWmPm78rrLu7QHyQcCfzTZkItndJfZxSIKPUzMleh_Ua0yWViNjZFl_I2gOHt36zRihBuBR5uq4kW6wN7nlwjg6xX4xHXiuYbVeOZeSLz4qNZLg41nAv4RkwtGWXjLq4WbptxF-wAYSlpwpOCNQ05mjeodV7q6-VcenK-w0AT8gtisPF4oQGzRnorqN_B49sKHCroG77QRL7M9aVJ6KHHEskhM",
  },
  {
    name: "Stationery",
    price: "₹449",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDT5ZqHMJjS1jUIMKkL4rHv6qYG2bjW9-PZdpIaZb03QdaCAeYsHopXHmRcUbtGOmfs7PDPmndXxFqLFxStp_vok5d5g1UGBe7SXRPduKTbOW6E3qFmisy03goTi9sSzKV_LIQqToIlsGOWWcSQ_Z-m7RxBSPm2tgT3Bm1UjxSnK4sIWEsbanMAWm8kd8JT-X5C3JcJXAoOfZTXSe2EiM0pqgR82CpDnRlVTx6g33V9NGbed5MaZjDBphCBH5IDKhQ5fCNi3RrMYT4",
  },
  {
    name: "Stickers & Labels",
    price: "₹299",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIB9U7dB2eixN1p08-0qm1uKXQO7VKpaTiWW7ileKpQbl7pt8Ev2ByFRNBYX1MqaHQvDFinQhVnfEsJRaQrksemT4I8jyDjoaWZ_cqmU54l2lbFRhRyMKnRClVpaD3sn9AMpZS1M8ncqGuvHCWsW7sULiLy3Xej5vIxxR24IvaOLl8pV6ASiH1cRBxqvtYG5TzZbVziFtHzA5vX-I-uh7QlECtiFRbGtv_6-wVVu96bir0Q12eZR1_yef094S1a2LuXP6SAxriiU0",
  },
];

const testimonials = [
  {
    quote:
      "The real-time pricing is a game-changer. I can quote my clients instantly without waiting hours for a sales rep to call back. Quality is always impeccable.",
    name: "Punjab & Sind Bank",
    role: "Corporate Banking Client",
    half: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcRirdy-tasuZV2aQQtVEZdGVwNQ-ezISvmTxgNHVyNBP-q8U76MsLvr8ZPTe5u_Bv0HIDy57LANQ4Jbvcn6en16aQknFBk203SpQ0S7zXSpxYBiqmZkZwCeTSt5BuAcsIIvESs4nBJJIk_Kx1cDFK_tb0vMX6EfV0k1v3mzrhEwcyCpCTlPFGci9yifDGTmkpheN3OClXVIRu2JSiBAvElui92iHnfouOwnXMzEiIDC3UfMHcSPVLhp9DQ2mWpg5PTpx9i2XQuoY",
  },
  {
    quote:
      "The prepaid wallet makes our procurement process so much easier. No more chasing accounts for every small order. Tracking is very precise.",
    name: "Creative Digital",
    role: "Creative & Branding Agency",
    half: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB27yeD01Ulaxq2b5cgOs5UPerGpArzxBoiML8zToCfF84QYuozq4FDNk_YN7UdEimc9lrGVv0vcA93x7y7ADFgjLdBgUPD2x3O_LQdbLOG6FzuxhXq-sev6eBy9pZx1rrA7reTu_2YdTnu3JZ-zavfIxxB3E_Kx6V8abt8IWMvHyd4_oSGWY57qB_x1w_kuj6hlvMaA3YA9CJTB5YExjO1k-P4Q6kdEap5rdM_pyNrQl6RHDKhfw1iaG47tlKCvcHSW54rATuHPiE",
  },
  {
    quote:
      "Best finishing in the industry. We've tried multiple vendors for our book printing, but Bhagini Graphics' binding and color accuracy are unmatched.",
    name: "K D International",
    role: "Export House",
    half: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKk5RRyLhI7r9nFaebmTP7WOxJ9Vtn-8nUFqsmmCVn0TdAlC1gXeJ9qiAiazRVPQF-23FAH8lH9uKBiT39HW-vjIyDfiOv5yal8ViIRUQYM5BhEJ5MCGEE4N3ynqFvG71XMlMxT8bPm1IvNrknDHho0tHVNmGlLZVYJYYV65OUwshvr48g1VvFvjUMsWJkso1NxtiSTNRjScTlxvW279yUOdoG6lcoPpbwE-imTAS__us1IMYNqPioW9D80kyG1K94Lsq1epT1utM",
  },
];


export default function LandingPage() {
  return (
    <>
      {/* Top Utility Strip */}
      <div className="bg-primary-container text-on-primary-container py-2 border-b border-white/5">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center font-label-caps text-label-caps">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">call</span> +91 7203000701
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">mail</span> bhaginigraphics@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <MarketingNav />

      {/* Hero */}
      <section id="home" className="hero-gradient relative overflow-hidden py-24 md:py-32 scroll-mt-24">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full primary-gradient animate-pulse"></span>
              <span className="font-label-caps text-label-caps tracking-wider uppercase">
                India&apos;s Fastest Online Printing Platform
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg mb-6 leading-[1.1]">
              Print{" "}
              <span className="relative inline-block">
                Smarter.
                <span className="absolute bottom-2 left-0 w-full h-4 bg-secondary-container/40 -z-10"></span>
              </span>
              <br />
              Deliver Faster.
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container mb-10 max-w-lg">
              Real-time quotes, prepaid wallet payments, and end-to-end order tracking. Experience industrial
              precision from the comfort of your studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="primary-gradient text-white px-8 py-4 rounded-xl font-button text-button shadow-xl shadow-secondary-container/30 flex items-center justify-center gap-2 group">
                Start Printing Now
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link href="/login" className="border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-button text-button transition-colors text-center">
                See How It Works
              </Link>
            </div>
          </div>

          {/* Interactive Price Card */}
          <div id="pricing" className="relative group scroll-mt-24">
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl py-3 px-6 shadow-2xl z-20 flex items-center gap-3 border border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">check_circle</span>
              </div>
              <span className="font-button text-on-surface font-bold">Order Confirmed!</span>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-2xl relative">
              <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
                Live Price Estimator
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">info</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Product Category</label>
                  <div className="w-full p-4 border border-outline-variant rounded-lg flex justify-between items-center font-body-md">
                    Business Cards (Premium)
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="flex-1 text-center font-display-lg text-headline-lg border-b-2 border-outline-variant py-1">500</div>
                    <button className="w-12 h-12 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Paper Type</label>
                    <div className="p-3 border border-outline-variant rounded-lg text-sm font-medium">350 GSM Matte</div>
                  </div>
                  <div>
                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Finish</label>
                    <div className="p-3 border border-outline-variant rounded-lg text-sm font-medium">Velvet Lamination</div>
                  </div>
                </div>
                <div className="pt-6 border-t border-outline-variant flex justify-between items-end">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Total (GST Inc.)</p>
                    <p className="font-display-lg text-display-lg text-primary">₹849<span className="text-headline-md font-bold">.00</span></p>
                  </div>
                  <Link href="/login" className="primary-gradient text-white px-8 py-4 rounded-xl font-button text-button shadow-lg shadow-secondary-container/20">
                    Add to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="bg-primary py-12 border-y border-white/10">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            ["50K+", "Orders Delivered"],
            ["12K+", "Happy Customers"],
            ["99.2%", "On-Time Shipping"],
            ["48hr", "Express Turnaround"],
          ].map(([value, label]) => (
            <div className="text-center" key={label}>
              <p className="font-display-lg text-headline-lg text-secondary-container mb-1">{value}</p>
              <p className="font-label-caps text-label-caps text-on-primary-container tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-surface py-12">
        <div className="max-w-container-max mx-auto px-gutter overflow-x-auto no-scrollbar">
          <div className="flex justify-between items-center gap-12 min-w-max">
            {[
              ["shield_lock", "SECURE PAYMENTS"],
              ["local_shipping", "PAN-INDIA DELIVERY"],
              ["calculate", "INSTANT QUOTES"],
              ["account_balance_wallet", "PREPAID WALLET"],
            ].map(([icon, label]) => (
              <div className="flex items-center gap-3 text-on-surface-variant" key={label}>
                <span className="material-symbols-outlined text-secondary-container">{icon}</span>
                <span className="font-label-caps text-label-caps font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section id="services" className="py-24 bg-surface-container-low scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="font-label-caps text-label-caps text-secondary font-extrabold uppercase tracking-[0.2em] mb-4">Our Catalog</p>
              <h2 className="font-display-lg text-headline-lg md:text-display-lg text-primary">Everything You Need to Print</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 font-button text-button text-primary hover:text-secondary-container transition-colors">
              Explore All Products <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((p) => (
              <div key={p.name} className="group bg-white rounded-xl overflow-hidden border border-outline-variant hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} src={p.img} />
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-[20px] text-primary mb-2">{p.name}</h4>
                  <p className="text-on-surface-variant font-body-md text-sm mb-4">
                    Starting from <span className="font-bold text-primary">{p.price}</span>
                  </p>
                  <Link href="/products" className="block text-center w-full border border-secondary-container text-secondary font-bold py-2 rounded-lg group-hover:bg-secondary-container group-hover:text-white transition-colors">
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
            {/* Dark CTA Card */}
            <div className="group bg-primary-container rounded-xl overflow-hidden relative flex flex-col justify-center items-center text-center p-8 hover:shadow-2xl transition-all duration-300">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-secondary-container text-[48px] mb-4">add_circle</span>
                <h4 className="font-headline-md text-white mb-2">&amp; Many More 50+</h4>
                <p className="text-on-primary-container font-body-md mb-6">Discover our full range of custom printing solutions.</p>
                <Link href="/products" className="inline-block bg-white text-primary font-bold px-6 py-2 rounded-lg hover:bg-secondary-container hover:text-white transition-colors">View All</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Bhagini Graphics Works */}
      <section id="how-it-works" className="bg-primary py-24 text-white overflow-hidden scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-20">
            <h2 className="font-display-lg text-display-lg mb-4">How Bhagini Graphics Works</h2>
            <p className="font-body-lg text-on-primary-container max-w-2xl mx-auto">
              Seamlessly go from concept to delivery with our state-of-the-art workflow designed for creative efficiency.
            </p>
          </div>
          <div className="relative">
            <div className="absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent hidden lg:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                ["01", "Create Account", "Sign up and access your specialized dashboard and wallet."],
                ["02", "Configure & Price", "Select specifications and get instant, dynamic pricing."],
                ["03", "Pay via Wallet", "Enjoy fast 1-click payments with your prepaid wallet."],
                ["04", "Track & Receive", "Real-time status updates until it reaches your doorstep."],
              ].map(([num, title, desc]) => (
                <div className="relative flex flex-col items-center text-center group" key={num}>
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-secondary-container transition-colors duration-500">
                    <span className="font-display-lg text-headline-lg text-white">{num}</span>
                    <div className="absolute -inset-2 rounded-full primary-gradient opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-3">{title}</h3>
                  <p className="text-on-primary-container font-body-md">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary-container py-24 border-t border-white/5">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-white mb-4">What Our Clients Say</h2>
            <p className="text-on-primary-container font-body-lg">Trusted by India&apos;s leading agencies and innovative startups.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl" key={t.name}>
                <span className="material-symbols-outlined text-secondary-container/40 text-[40px] mb-2 block">format_quote</span>
                <p className="text-white font-body-md mb-8 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt={t.name} src={t.img} />
                  </div>
                  <div>
                    <p className="font-button text-white">{t.name}</p>
                    <p className="text-on-primary-container text-[12px] uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 text-center">
          <h2 className="font-display-lg text-display-lg text-white mb-6">Ready to Print Smarter?</h2>
          <p className="text-on-primary-container font-body-lg mb-12 max-w-xl mx-auto">
            Join 12,000+ businesses and creative professionals who trust Bhagini Graphics for their high-end printing needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/login" className="primary-gradient text-white px-10 py-4 rounded-xl font-button text-button shadow-2xl shadow-secondary-container/40 active:scale-95 transition-transform">
              Create Free Account
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-xl font-button text-button transition-colors">
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary-container text-white py-16 border-t border-white/5 scroll-mt-20">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <BrandLogo textClass="text-headline-md" iconSize={30} />
            <p className="text-on-primary-container text-sm leading-relaxed">
              India&apos;s leading cloud-based printing infrastructure. High-fidelity prints, industrial scale, and creative freedom in every pixel.
            </p>
            <div className="flex gap-4">
              {["share", "public", "chat"].map((icon) => (
                <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary-container transition-colors" href="#" key={icon}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            ["Products", ["Marketing Collaterals", "Corporate Stationery", "Packaging Solutions", "Custom Apparels", "Bulk Orders"]],
            ["Company", ["About Us", "Our Production Hub", "Quality Standards", "Sustainability", "Contact Support"]],
            ["Support", ["Shipping Policy", "Cancellations & Refunds", "Privacy Policy", "Terms of Service", "Sitemap"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <h4 className="font-button text-white mb-6">{heading as string}</h4>
              <ul className="space-y-4 text-on-primary-container text-sm">
                {(links as string[]).map((l) => (
                  <li key={l}><a className="hover:text-secondary-container transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-container-max mx-auto px-gutter pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-on-primary-container text-[12px]">
            © 2024 Bhagini Graphics. All rights reserved. GSTIN: 24CHLPB0341K1ZO
          </div>
          <div className="flex items-center gap-6 grayscale opacity-50">
            <span className="material-symbols-outlined" title="Visa">credit_card</span>
            <span className="material-symbols-outlined" title="Mastercard">payments</span>
            <span className="material-symbols-outlined" title="UPI">account_balance</span>
          </div>
        </div>
      </footer>
    </>
  );
}

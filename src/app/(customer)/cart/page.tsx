import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cart & Checkout | Bhagini Graphics" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

type CartItem = {
  name: string;
  tags: string[];
  express?: boolean;
  price: string;
  img: string;
  file: { ready: boolean; label: string };
};

const items: CartItem[] = [
  {
    name: "500 Business Cards",
    tags: ["Matte 350gsm", "Standard Size"],
    express: true,
    price: "₹850",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk7K43-ei5jYgwW1e7pXHnntslvOerw11CJ7xmQJx-_JeV5PgDsUk7PIyI6JxzQNJax0VntBfTLrcsZ4JZ9Vec7Dj_DX-s_ynfF5VNBVSNPJ17EjjheqOHX9gJ9f4jdJhSpBH8g0-4ZY51QDI5Tks-XTLX1PSZ3Us2kBDpwCbhtTlIOO3UeGPj_sgjJ8FRQazgvH_09hxW2S5WKucfYQkmgjX9SUWCLRMTl-B-e0EDdG4pKrIqUUyqEmTWNXUQ6Fsoawllg7Cdw3M",
    file: { ready: true, label: "design.pdf · Ready for print" },
  },
  {
    name: "100 Trifold Brochures",
    tags: ["Glossy 170gsm", "A4 Tri-fold"],
    price: "₹549",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDauKwOTVZWbp4cQQLD5jW5g6vATfdCChkD06yFByYhoiubQKZuEgLxpjtY_xhBI9n46bg1E21qgSetDVa2Tdi7JY5zk5-3Luv-xFQ_1b0cxHzAWaThLYDImg1FO1jWOYQNf3cGPhBVMzdouIoIMLXjpSu6OomgwqUEYNmAsR5wj4dWoktVKNX5iFpQ2WOStTZ9YZ_gAX_YzVViT5VgurNdVou96gIsPdHOWbddXPBXUtPRnxYY72DX7P_bC-DBkqNJNijno_oO-eI",
    file: { ready: false, label: "Design file not uploaded" },
  },
  {
    name: "50 Luxury Packaging",
    tags: ["Rigid Box", "Custom Size"],
    price: "₹288",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOeVDxHAGkMFi1WTBeBKKfsfm2NYUF_uKKzc_VPpyfn3rD50SlNh9HEKs8iGA0kr3bVkXWEueNP4zSOyKH1nXEx4PQ7TLT5S_mjoVLVg3F0Abeak8I_fOa-whHjvB-5ot4dV8Kv9IHqWEZghPaj_hqmPoPg-G3imlpNgzjxjl-jYsqvuSzulWZ_H3TSjYDa1W_Qztp1br17ryvGlrI2l-AW7jq-9tPIBiqm2d9qIwV_FVEtStsP_KOrF0aqiCMadX-ybYCk8Q2wVg",
    file: { ready: true, label: "box_template.ai · Ready for print" },
  },
];


export default function CartCheckout() {
  return (
    <>
      <main className="max-w-container-max mx-auto px-margin-desktop py-12">
        {/* Header */}
        <section className="mb-10">
          <nav className="flex items-center gap-2 text-label-caps font-label-caps text-on-surface-variant mb-4">
            <Link className="hover:text-primary" href="/dashboard">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Cart</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Cart &amp; Checkout</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review your premium print items and proceed to secure delivery.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-primary-container text-on-primary px-4 py-2 rounded-lg border border-outline-variant shadow-sm">
                <span className="material-symbols-outlined text-[20px] mr-2">account_balance_wallet</span>
                <span className="font-button text-button">₹2,450</span>
              </div>
              <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-button text-button">Items in Cart: 3</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left: Cart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.name} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt={it.name} src={it.img} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="font-headline-md text-headline-md text-on-surface">{it.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {it.tags.map((t) => (
                              <span key={t} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-label-caps font-label-caps uppercase">{t}</span>
                            ))}
                            {it.express && (
                              <span className="bg-on-tertiary-container/10 text-on-tertiary-container px-2 py-0.5 rounded text-label-caps font-label-caps flex items-center">
                                <span className="material-symbols-outlined text-[14px] mr-1">bolt</span> Express
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-price-lg text-price-lg text-primary">{it.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-10">
                          <button className="px-3 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                          <span className="px-4 font-button text-button border-x border-outline-variant">1</span>
                          <button className="px-3 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
                        </div>
                        <button className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                    {it.file.ready ? (
                      <div className="flex items-center text-secondary font-medium text-body-md">
                        <span className="material-symbols-outlined mr-2 text-[20px]">check_circle</span>
                        <span>{it.file.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-on-tertiary-container font-medium text-body-md">
                        <span className="material-symbols-outlined mr-2 text-[20px] text-on-secondary-container">warning</span>
                        <span>{it.file.label}</span>
                      </div>
                    )}
                    <button className={`font-button text-button hover:underline ${it.file.ready ? "text-primary" : "text-secondary-container"}`}>
                      {it.file.ready ? "Change" : "Upload Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link className="inline-flex items-center text-primary font-button text-button hover:underline group" href="/products">
              <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span> Continue Shopping
            </Link>

            {/* Delivery Address */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface">Delivery Address</h2>
                <button className="text-secondary font-button text-button flex items-center hover:bg-secondary-fixed/30 px-3 py-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined mr-1 text-[20px]">add</span> Add New Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative border-2 border-secondary bg-secondary/5 p-5 rounded-xl transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-button text-button text-on-secondary-container">Office <span className="text-label-caps font-label-caps opacity-70 ml-2">(Default)</span></span>
                    <span className="material-symbols-outlined text-secondary" style={fill1}>check_circle</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">402, Creative Hub, Industrial Estate Phase II,<br />Sector 63, Noida, Uttar Pradesh 201301</p>
                  <p className="mt-3 text-body-md font-semibold text-on-surface">+91 98765 43210</p>
                </div>
                <div className="border border-outline-variant bg-surface p-5 rounded-xl hover:border-on-surface-variant transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-button text-button text-on-surface">Home</span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-on-surface-variant transition-colors">circle</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">Flat 12A, Sapphire Residency, Green Valley,<br />Gurgaon, Haryana 122018</p>
                  <p className="mt-3 text-body-md font-semibold text-on-surface">+91 98123 45678</p>
                </div>
              </div>
            </section>

            {/* Order Notes */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Order Notes</h2>
              <label className="block mb-2 text-label-caps font-label-caps text-on-surface-variant">Add any specific delivery or print instructions</label>
              <textarea className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary/20" placeholder="e.g., Call before delivery, use heavy duty outer packaging..." rows={3}></textarea>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky-summary space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <div className="header-deep-gradient p-6">
                  <h3 className="text-white font-headline-md text-headline-md">Order Summary</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2 pb-4 border-b border-outline-variant">
                    {[["500 Business Cards", "₹850"], ["100 Trifold Brochures", "₹549"], ["50 Luxury Packaging", "₹288"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-body-md"><span className="text-on-surface-variant">{k}</span><span className="text-on-surface">{v}</span></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[["Subtotal", "₹1,687"], ["Delivery Charges", "₹148"], ["GST (18%)", "₹304"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-body-md"><span className="text-on-surface-variant">{k}</span><span className="text-on-surface">{v}</span></div>
                    ))}
                  </div>
                  <div className="pt-4 mt-4 border-t-2 border-dashed border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-md text-headline-md">Total Payable</span>
                      <div className="text-right">
                        <span className="font-price-lg text-price-lg text-secondary">₹2,139</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Payment Method</h3>
                <p className="text-label-caps font-label-caps text-on-surface-variant mb-6">Orders are paid using your prepaid wallet balance.</p>
                <div className="border-2 border-secondary bg-secondary/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={fill1}>wallet</span>
                      <span className="font-button text-button">Bhagini Wallet</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                  </div>
                  <div className="flex items-center justify-between pl-9">
                    <p className="text-label-caps font-label-caps text-on-surface-variant">Available Balance</p>
                    <p className="font-price-lg text-body-md text-secondary">₹2,450</p>
                  </div>
                </div>
                <Link href="/wallet" className="mt-4 p-4 rounded-lg bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-between hover:border-secondary transition-colors">
                  <span className="text-body-md text-on-surface-variant">Low balance? Top up your wallet</span>
                  <span className="text-secondary font-bold text-body-md">Recharge</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-4">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-headline-md text-headline-md text-on-surface">Total to Pay ₹2,139</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-6 mb-1">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">verified</span><span className="text-label-caps font-label-caps text-on-surface-variant">Quality Assured</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">encrypted</span><span className="text-label-caps font-label-caps text-on-surface-variant">Secure Checkout</span></div>
            </div>
            <Link href="/order-confirmed" className="primary-accent-gradient text-white px-10 py-4 rounded-lg font-button text-button shadow-lg shadow-secondary/30 active:scale-95 transition-all w-full md:w-auto text-center">
              Place Order &amp; Pay ₹2,139
            </Link>
          </div>
        </div>
      </div>
      <div className="h-40"></div>
    </>
  );
}

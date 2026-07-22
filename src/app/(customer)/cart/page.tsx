"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { cart as cartApi, addresses as addrApi, orders as ordersApi, ApiError } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

interface CartItem {
  id: string;
  productName: string;
  productSlug: string;
  image: string | null;
  quantity: number;
  specSnapshot: { group: string; option: string }[];
  deliverySpeed: string | null;
  deliveryFee: number;
  unitPrice: number;
  lineSubtotal: number;
  gstAmount: number;
  lineTotal: number;
  fileStatus: string;
  fileName: string | null;
}
interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  total: number;
  count: number;
}
interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

const emptyAddr = { label: "Office", name: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export default function CartCheckout() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const confirm = useConfirm();
  const toast = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addr, setAddr] = useState(emptyAddr);
  // Per-item in-flight lock so rapid clicks can't race (money-sensitive).
  const [busyItems, setBusyItems] = useState<Set<string>>(new Set());
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const setBusy = (id: string, on: boolean) =>
    setBusyItems((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const loadCart = useCallback(() => cartApi.get().then((c) => setCart(c as Cart)), []);
  const loadAddresses = useCallback(
    () =>
      addrApi.list().then((r) => {
        const list = (r.addresses ?? []) as Address[];
        setAddresses(list);
        setSelectedAddr((prev) => prev ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
      }),
    [],
  );

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, [loadCart, loadAddresses]);

  async function changeQty(item: CartItem, delta: number) {
    const q = Math.max(1, item.quantity + delta);
    if (q === item.quantity || busyItems.has(item.id)) return;
    setBusy(item.id, true);
    try {
      setCart((await cartApi.updateQty(item.id, q)) as Cart);
      refresh();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update quantity", "error");
    } finally {
      setBusy(item.id, false);
    }
  }

  async function removeItem(item: CartItem) {
    if (busyItems.has(item.id)) return;
    const ok = await confirm({
      title: "Remove this item?",
      message: `${item.quantity} × ${item.productName} will be removed from your cart.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    setBusy(item.id, true);
    try {
      setCart((await cartApi.remove(item.id)) as Cart);
      refresh();
      toast("Item removed", "success");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not remove item", "error");
    } finally {
      setBusy(item.id, false);
    }
  }

  async function uploadFor(item: CartItem, file: File) {
    setBusy(item.id, true);
    try {
      const res = await cartApi.uploadFile(item.id, file);
      setCart(res.cart as Cart);
      toast("Artwork uploaded", "success");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Upload failed", "error");
    } finally {
      setBusy(item.id, false);
    }
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingAddr(true);
    try {
      await addrApi.create({ ...addr, isDefault: addresses.length === 0 });
      setShowAddrForm(false);
      setAddr(emptyAddr);
      await loadAddresses();
      toast("Address saved", "success");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save address");
    } finally {
      setSavingAddr(false);
    }
  }

  async function placeOrder() {
    if (!selectedAddr) {
      setError("Please select a delivery address");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const { order } = await ordersApi.place(selectedAddr, notes || undefined);
      refresh();
      router.push(`/order-confirmed?order=${order.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not place order");
      setPlacing(false);
    }
  }

  const total = cart?.total ?? 0;
  const enough = (user?.walletBalance ?? 0) >= total;

  if (!cart) {
    return (
      <main className="max-w-container-max mx-auto px-margin-desktop py-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="max-w-container-max mx-auto px-margin-desktop py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">shopping_cart</span>
        <h1 className="font-headline-lg text-headline-lg mb-2">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-8">Browse the catalog and configure your print job.</p>
        <Link href="/products" className="primary-accent-gradient text-white px-8 py-3 rounded-lg font-button">Browse Products</Link>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-container-max mx-auto px-margin-desktop py-12">
        <section className="mb-10">
          <nav className="flex items-center gap-2 text-label-caps font-label-caps text-on-surface-variant mb-4">
            <Link className="hover:text-primary" href="/dashboard">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Cart</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Cart &amp; Checkout</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review your items and pay securely from your wallet.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-primary-container text-on-primary px-4 py-2 rounded-lg border border-outline-variant shadow-sm">
                <span className="material-symbols-outlined text-[20px] mr-2">account_balance_wallet</span>
                <span className="font-button text-button">{inr(user?.walletBalance)}</span>
              </div>
              <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-button text-button">Items in Cart: {cart.count}</div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-error-container/60 text-on-error-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>{error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              {cart.items.map((it) => {
                const ready = it.fileStatus === "UPLOADED" || it.fileStatus === "APPROVED";
                return (
                  <div key={it.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant flex items-center justify-center">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="w-full h-full object-cover" alt={it.productName} src={it.image} />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">print</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h3 className="font-headline-md text-headline-md text-on-surface">{it.quantity.toLocaleString("en-IN")} × {it.productName}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {it.specSnapshot?.map((s, i) => (
                                <span key={i} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-label-caps font-label-caps uppercase">{s.option}</span>
                              ))}
                              {it.deliverySpeed && (
                                <span className="bg-on-tertiary-container/10 text-on-tertiary-container px-2 py-0.5 rounded text-label-caps font-label-caps flex items-center">
                                  <span className="material-symbols-outlined text-[14px] mr-1">bolt</span> {it.deliverySpeed}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-price-lg text-price-lg text-primary">{inr(it.lineSubtotal + it.gstAmount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                          <div className={`flex items-center border border-outline-variant rounded-lg overflow-hidden h-10 ${busyItems.has(it.id) ? "opacity-60" : ""}`}>
                            <button onClick={() => changeQty(it, -1)} disabled={busyItems.has(it.id) || it.quantity <= 1} aria-label="Decrease quantity" className="px-3 h-full min-w-11 flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">remove</span></button>
                            <span className="px-4 font-button text-button border-x border-outline-variant" aria-live="polite">{it.quantity}</span>
                            <button onClick={() => changeQty(it, 1)} disabled={busyItems.has(it.id)} aria-label="Increase quantity" className="px-3 h-full min-w-11 flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span></button>
                          </div>
                          <button onClick={() => removeItem(it)} disabled={busyItems.has(it.id)} aria-label={`Remove ${it.productName}`} className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors disabled:opacity-40"><span className="material-symbols-outlined" aria-hidden="true">delete</span></button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                      {ready ? (
                        <div className="flex items-center text-secondary font-medium text-body-md">
                          <span className="material-symbols-outlined mr-2 text-[20px]">check_circle</span>
                          <span>{it.fileName} · Ready for print</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-on-tertiary-container font-medium text-body-md">
                          <span className="material-symbols-outlined mr-2 text-[20px] text-on-secondary-container">warning</span>
                          <span>Design file not uploaded</span>
                        </div>
                      )}
                      <input
                        ref={(el) => { fileInputs.current[it.id] = el; }}
                        type="file"
                        className="hidden"
                        accept=".pdf,.ai,.psd,.png,.jpg,.jpeg"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFor(it, f); }}
                      />
                      <button onClick={() => fileInputs.current[it.id]?.click()} disabled={busyItems.has(it.id)} className={`font-button text-button hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1.5 ${ready ? "text-primary" : "text-secondary-container"}`}>
                        {busyItems.has(it.id) && <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">progress_activity</span>}
                        {busyItems.has(it.id) ? "Uploading…" : ready ? "Change" : "Upload Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link className="inline-flex items-center text-primary font-button text-button hover:underline group" href="/products">
              <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span> Continue Shopping
            </Link>

            {/* Delivery Address */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface">Delivery Address</h2>
                <button onClick={() => setShowAddrForm((v) => !v)} className="text-secondary font-button text-button flex items-center hover:bg-secondary-fixed/30 px-3 py-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined mr-1 text-[20px]">add</span> Add New Address
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={saveAddress} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-surface-container-low p-4 rounded-xl">
                  {([
                    ["label", "Label (Office/Home)", {}],
                    ["name", "Contact name", {}],
                    ["phone", "Phone — 10 digits, starts 6-9", { inputMode: "numeric" as const, maxLength: 10, pattern: "[6-9][0-9]{9}" }],
                    ["line1", "Address line 1", {}],
                    ["line2", "Address line 2 (optional)", {}],
                    ["city", "City", {}],
                    ["state", "State", {}],
                    ["pincode", "PIN code — 6 digits", { inputMode: "numeric" as const, maxLength: 6, pattern: "[0-9]{6}" }],
                  ] as [keyof typeof emptyAddr, string, Record<string, unknown>][]).map(([k, ph, extra]) => (
                    <input
                      key={k}
                      required={k !== "line2"}
                      placeholder={ph}
                      title={ph}
                      value={addr[k]}
                      onChange={(e) => setAddr((a) => ({ ...a, [k]: e.target.value }))}
                      className="px-3 py-2 rounded-lg border border-outline-variant bg-white text-body-md"
                      {...extra}
                    />
                  ))}
                  <div className="md:col-span-2 flex gap-2">
                    <button type="submit" className="primary-accent-gradient text-white px-5 py-2 rounded-lg font-button">Save Address</button>
                    <button type="button" onClick={() => setShowAddrForm(false)} className="px-5 py-2 rounded-lg border border-outline-variant">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((a) => {
                  const active = selectedAddr === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAddr(a.id)}
                      className={`relative text-left p-5 rounded-xl transition-all ${active ? "border-2 border-secondary bg-secondary/5" : "border border-outline-variant bg-surface hover:border-on-surface-variant"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-button text-button text-on-secondary-container">{a.label}{a.isDefault && <span className="text-label-caps font-label-caps opacity-70 ml-2">(Default)</span>}</span>
                        <span className={`material-symbols-outlined ${active ? "text-secondary" : "text-outline-variant"}`} style={active ? fill1 : undefined}>{active ? "check_circle" : "circle"}</span>
                      </div>
                      <p className="text-body-md text-on-surface-variant leading-relaxed">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}</p>
                      <p className="mt-3 text-body-md font-semibold text-on-surface">{a.phone}</p>
                    </button>
                  );
                })}
                {addresses.length === 0 && !showAddrForm && (
                  <p className="text-on-surface-variant text-body-md">No saved addresses. Add one to continue.</p>
                )}
              </div>
            </section>

            {/* Order Notes */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Order Notes</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary/20" placeholder="e.g., Call before delivery, use heavy duty outer packaging..." rows={3}></textarea>
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
                    {cart.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-body-md"><span className="text-on-surface-variant truncate pr-2">{it.quantity} × {it.productName}</span><span className="text-on-surface whitespace-nowrap">{inr(it.lineSubtotal + it.gstAmount)}</span></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Subtotal</span><span className="text-on-surface">{inr(cart.subtotal)}</span></div>
                    <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Delivery Charges</span><span className="text-on-surface">{cart.deliveryCharge === 0 ? "FREE" : inr(cart.deliveryCharge)}</span></div>
                    <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">GST (18%)</span><span className="text-on-surface">{inr(cart.gst)}</span></div>
                  </div>
                  <div className="pt-4 mt-4 border-t-2 border-dashed border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-md text-headline-md">Total Payable</span>
                      <span className="font-price-lg text-price-lg text-secondary">{inr(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Payment Method</h3>
                <p className="text-label-caps font-label-caps text-on-surface-variant mb-6">Orders are paid using your prepaid wallet balance.</p>
                <div className={`border-2 rounded-xl p-4 ${enough ? "border-secondary bg-secondary/5" : "border-error/50 bg-error-container/20"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={fill1}>wallet</span>
                      <span className="font-button text-button">Bhagini Wallet</span>
                    </div>
                    <span className={`material-symbols-outlined ${enough ? "text-secondary" : "text-error"}`}>{enough ? "check_circle" : "error"}</span>
                  </div>
                  <div className="flex items-center justify-between pl-9">
                    <p className="text-label-caps font-label-caps text-on-surface-variant">Available Balance</p>
                    <p className="font-price-lg text-body-md text-secondary">{inr(user?.walletBalance)}</p>
                  </div>
                </div>
                {!enough && (
                  <Link href="/wallet" className="mt-4 p-4 rounded-lg bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-between hover:border-secondary transition-colors">
                    <span className="text-body-md text-on-surface-variant">Low balance? Top up your wallet</span>
                    <span className="text-secondary font-bold text-body-md">Recharge</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-4">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-headline-md text-headline-md text-on-surface">Total to Pay {inr(total)}</p>
          </div>
          <button
            onClick={placeOrder}
            disabled={placing || !enough || !selectedAddr}
            className="primary-accent-gradient text-white px-10 py-4 rounded-lg font-button text-button shadow-lg shadow-secondary/30 active:scale-95 transition-all w-full md:w-auto text-center disabled:opacity-50 disabled:pointer-events-none"
          >
            {placing
              ? "Placing order…"
              : !selectedAddr
                ? "Select a delivery address"
                : !enough
                  ? "Insufficient Wallet Balance"
                  : `Place Order & Pay ${inr(total)}`}
          </button>
        </div>
      </div>
      <div className="h-40"></div>
    </>
  );
}

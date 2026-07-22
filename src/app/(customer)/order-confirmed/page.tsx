"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  lineSubtotal: number;
  deliveryEtaLabel: string | null;
}

interface Shipping {
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  shipping: Shipping | null;
  items: OrderItem[];
}

function GenericSuccess() {
  return (
    <main className="min-h-screen">
      <section className="relative deep-navy-gradient py-20 overflow-hidden">
        <div className="absolute inset-0 confetti-pattern"></div>
        <div className="relative max-w-container-max mx-auto px-margin-desktop text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-8">
            <span className="material-symbols-outlined text-secondary-container" style={fill1} aria-hidden="true">check_circle</span>
            <span className="font-label-caps text-label-caps text-white">Order Placed Successfully</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-white mb-4">Thank you! 🎉</h1>
          <p className="font-body-lg text-body-lg text-on-primary-container mb-8">Your order has been placed successfully.</p>
          <Link href="/orders" className="inline-flex items-center gap-3 bg-white text-primary py-3 px-8 rounded-xl font-button shadow-lg">
            <span className="material-symbols-outlined">receipt_long</span> View My Orders
          </Link>
        </div>
      </section>
    </main>
  );
}

function StateCard({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-margin-desktop py-20">
      <div role={tone === "error" ? "alert" : undefined} className={`bg-surface-container-lowest rounded-xl premium-shadow p-16 flex flex-col items-center justify-center text-center max-w-lg w-full ${tone === "error" ? "border-l-4 border-error" : ""}`}>
        {children}
      </div>
    </main>
  );
}

function OrderConfirmedInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ordersApi.get(orderId);
        if (!cancelled) setOrder(res.order as OrderDetail);
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!orderId) return <GenericSuccess />;

  if (loading) {
    return (
      <StateCard>
        <span className="material-symbols-outlined text-secondary text-4xl animate-spin mb-3" aria-hidden="true">progress_activity</span>
        <p className="text-on-surface-variant">Confirming your order…</p>
      </StateCard>
    );
  }

  if (error || !order) {
    return (
      <StateCard tone="error">
        <span className="material-symbols-outlined text-error text-4xl mb-3" aria-hidden="true">error</span>
        <p className="font-bold text-primary mb-1">Could not load your order</p>
        <p className="text-on-surface-variant mb-6">{error ?? "Order not found"}</p>
        <Link href="/orders" className="px-8 py-3 premium-gradient text-white rounded-lg font-button shadow-md">View My Orders</Link>
      </StateCard>
    );
  }

  const s = order.shipping ?? {};

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative deep-navy-gradient py-20 overflow-hidden">
        <div className="absolute inset-0 confetti-pattern"></div>
        <div className="relative max-w-container-max mx-auto px-margin-desktop text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-8 motion-safe:animate-bounce">
            <span className="material-symbols-outlined text-secondary-container" style={fill1} aria-hidden="true">check_circle</span>
            <span className="font-label-caps text-label-caps text-white">Order Placed Successfully</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-white mb-4">Thank you! 🎉</h1>
          <p className="font-body-lg text-body-lg text-on-primary-container mb-8">Order Number <span className="font-bold text-secondary-container">#{order.orderNumber}</span></p>
          <div className="inline-block bg-white/10 backdrop-blur-md text-white font-button px-8 py-3 rounded-xl shadow-xl border border-white/20">
            Paid via Wallet <span className="font-black text-secondary-container">{inr(order.totalAmount)}</span>
          </div>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-desktop py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Items */}
            <div className="space-y-4">
              <h3 className="font-headline-md text-headline-md px-2">Order Items ({order.items.length})</h3>
              {order.items.map((it) => (
                <div key={it.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex gap-6 hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-4xl text-outline">print</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-headline-md text-lg">{it.quantity} × {it.productName}</h4>
                      <span className="font-bold text-primary">{inr(it.lineSubtotal)}</span>
                    </div>
                    {it.deliveryEtaLabel && (
                      <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">local_shipping</span> {it.deliveryEtaLabel}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            {order.shipping && (
              <div className="bg-surface-container-low p-8 rounded-2xl">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">Shipping Address</h3>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">home_pin</span>
                  <div>
                    {s.name && <p className="font-bold">{s.name}</p>}
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {[s.line1, s.line2].filter(Boolean).join(", ")}
                      {(s.line1 || s.line2) && <br />}
                      {[s.city, s.state, s.pincode].filter(Boolean).join(", ")}
                      {s.phone && <><br />Tel: {s.phone}</>}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-gutter">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-outline-variant">
              <h3 className="font-headline-md text-lg mb-6">Payment Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-on-surface-variant"><span>Item Subtotal</span><span>{inr(order.subtotal)}</span></div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  {order.deliveryCharge > 0 ? <span>{inr(order.deliveryCharge)}</span> : <span className="text-green-600 font-bold">FREE</span>}
                </div>
                <div className="flex justify-between text-on-surface-variant"><span>GST (18%)</span><span>{inr(order.gstAmount)}</span></div>
                <div className="pt-4 border-t-2 border-primary flex justify-between items-center">
                  <span className="font-black text-lg text-primary">Total Paid</span>
                  <span className="font-price-lg text-price-lg text-primary">{inr(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href={`/orders/${order.id}`} className="w-full bg-primary text-white py-4 rounded-xl font-button flex items-center justify-center gap-3 hover:bg-on-surface transition-colors shadow-lg">
                <span className="material-symbols-outlined text-xl">map</span> Track My Order
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/orders" className="bg-surface-container-high py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined">receipt_long</span> My Orders
                </Link>
                <Link href="/products" className="bg-surface-container-high py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined">shopping_bag</span> Shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmed() {
  return (
    <Suspense
      fallback={
        <StateCard>
          <span className="material-symbols-outlined text-secondary text-4xl animate-spin mb-3" aria-hidden="true">progress_activity</span>
          <p className="text-on-surface-variant">Loading…</p>
        </StateCard>
      }
    >
      <OrderConfirmedInner />
    </Suspense>
  );
}

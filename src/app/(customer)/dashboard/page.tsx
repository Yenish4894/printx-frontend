"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";
import { formatDateTime } from "@/lib/format";
import { statusLabel, statusBadge } from "@/lib/orderStatus";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: string[];
  placedAt: string;
}

// Orders still moving through fulfilment (counts toward "in progress").
const IN_PROGRESS = new Set([
  "PLACED",
  "PAYMENT_CONFIRMED",
  "DESIGN_REVIEW",
  "IN_PRODUCTION",
  "PRINTING",
  "READY",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
]);

export default function CustomerDashboard() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.list();
      setOrders((res.orders as OrderRow[]) ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalOrders = orders?.length ?? 0;
  const inProgress = orders?.filter((o) => IN_PROGRESS.has(o.status)).length ?? 0;
  const nonCancelled = orders?.filter((o) => o.status !== "CANCELLED") ?? [];
  const paidOrderCount = nonCancelled.length;
  const totalSpent = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
  const recent = orders?.slice(0, 5) ?? [];

  const greetingName = user?.ownerName ?? user?.businessName ?? "there";
  const walletBalance = user?.walletBalance ?? 0;

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="header-deep-gradient rounded-xl p-8 text-on-primary flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="w-20 h-20 rounded-xl border-4 border-white/10 shadow-lg bg-white/10 flex items-center justify-center text-white text-3xl font-black">
            {(user?.businessName ?? user?.ownerName ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-headline-lg text-white">
              Good day 👋 {sessionLoading ? "…" : greetingName}
            </h1>
            <p className="text-on-primary-container/80 font-body-md mt-1">
              {user?.businessName ?? "Your Business"} ·{" "}
              {loading ? "Loading orders…" : `${totalOrders} order${totalOrders === 1 ? "" : "s"} placed`}
            </p>
          </div>
        </div>
        <div className="flex gap-4 z-10 w-full md:w-auto">
          <Link href="/products" className="primary-accent-gradient text-on-primary px-6 py-3 rounded-lg font-button flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 flex-1 md:flex-none">
            <span aria-hidden="true" className="material-symbols-outlined">add_circle</span> New Print Order
          </Link>
          <Link href="/wallet" className="border-2 border-secondary-fixed-dim text-secondary-fixed-dim px-6 py-3 rounded-lg font-button hover:bg-white/5 transition-all active:scale-95 flex-1 md:flex-none text-center">
            Top Up Wallet
          </Link>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="shrink-0 px-4 py-2 rounded-lg bg-red-600 text-white text-xs uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Wallet Balance</span>
            <span aria-hidden="true" className="material-symbols-outlined text-secondary">account_balance_wallet</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-price-lg text-headline-lg text-on-surface">
              {sessionLoading ? "…" : inr(walletBalance)}
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <Link href="/wallet" className="text-secondary font-bold text-xs hover:underline">
              Manage wallet →
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Total Orders</span>
            <span aria-hidden="true" className="material-symbols-outlined text-on-primary-fixed-variant">print</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-price-lg text-headline-lg text-on-surface">
              {loading ? "…" : totalOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-on-primary-fixed-variant mt-2 px-2 py-1 bg-primary-fixed/30 inline-block rounded">
            {inProgress} in progress
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Total Spent</span>
            <span aria-hidden="true" className="material-symbols-outlined text-on-primary-fixed-variant">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-price-lg text-headline-lg text-on-surface">
              {loading ? "…" : inr(totalSpent)}
            </span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant mt-2">
            Across {paidOrderCount} order{paidOrderCount === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {/* Recent Activity (full width) */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-on-surface">Recent Orders</h3>
          <Link className="text-secondary font-bold text-xs hover:underline" href="/orders">View All</Link>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-on-surface-variant">Loading recent orders…</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-on-surface-variant">Couldn&apos;t load your recent orders.</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <span aria-hidden="true" className="material-symbols-outlined text-4xl text-on-surface-variant/40">receipt_long</span>
              <p className="text-sm font-bold text-on-surface">No orders yet</p>
              <p className="text-xs text-on-surface-variant">Place your first print order to see it here.</p>
              <Link href="/products" className="inline-block mt-2 text-secondary font-bold text-xs hover:underline">Browse Products →</Link>
            </div>
          ) : (
            recent.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="p-5 flex items-center justify-between hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/5 text-primary">
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">
                      #{o.orderNumber}
                      {o.items.length > 0 ? ` · ${o.items[0]}` : ""}
                      {o.itemCount > 1 ? ` +${o.itemCount - 1} more` : ""}
                    </p>
                    <p className="text-xs text-on-surface-variant">Order placed · {formatDateTime(o.placedAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-on-surface">{inr(o.totalAmount)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusBadge(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

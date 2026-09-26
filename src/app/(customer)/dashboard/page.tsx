"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";
import { formatDateTime } from "@/lib/format";
import { statusLabel, statusBadge } from "@/lib/orderStatus";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: string[];
  placedAt: string;
}

export default function CustomerDashboard() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({ totalOrders: 0, inProgress: 0, awaitingPayment: 0, paidOrderCount: 0, totalSpent: 0 });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The page renders five rows and four KPIs. It used to download every
      // order ever placed to work those out; the KPIs are DB aggregates now.
      const res = await ordersApi.list({ pageSize: 5 });
      setOrders((res.orders as OrderRow[]) ?? []);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Started from a timer callback, not synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(t);
  }, [loadOrders]);

  const { totalOrders, inProgress, awaitingPayment, paidOrderCount, totalSpent } = stats;
  const recent = orders ?? [];

  const greetingName = user?.ownerName ?? user?.businessName ?? "there";

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
            <p className="text-on-primary-container font-body-md mt-1">
              {user?.businessName ?? "Your Business"} ·{" "}
              {loading ? "Loading orders…" : `${totalOrders} order${totalOrders === 1 ? "" : "s"} placed`}
            </p>
          </div>
        </div>
        <div className="flex gap-4 z-10 w-full md:w-auto">
          <ButtonLink href="/products" icon="add_circle" className="flex-1 md:flex-none">
            New print order
          </ButtonLink>
          {/* On the dark banner the secondary variant's light border would
              disappear, so it keeps the banner-specific outline. */}
          <ButtonLink
            href="/orders"
            variant="ghost"
            className="flex-1 md:flex-none border border-secondary-fixed-dim text-secondary-fixed-dim hover:bg-white/10"
          >
            My orders
          </ButtonLink>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {error && (
        <div role="alert" className="bg-error-container border border-error/20 text-on-error-container rounded-xl p-4 text-sm font-bold flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="shrink-0 px-4 py-2 rounded-lg bg-error text-on-error text-xs uppercase tracking-wide hover:brightness-110 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Awaiting Payment</span>
            <span aria-hidden="true" className="material-symbols-outlined text-secondary">account_balance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-price-lg text-headline-lg text-on-surface">
              {loading ? "…" : awaitingPayment}
            </span>
          </div>
          <div className="mt-4 space-y-1">
            {awaitingPayment > 0 ? (
              <Link href="/orders" className="text-secondary font-bold text-xs hover:underline">
                Complete your payment →
              </Link>
            ) : (
              <p className="text-xs text-on-surface-variant">Nothing to pay right now</p>
            )}
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
          <h2 className="font-headline-md text-on-surface">Recent Orders</h2>
          <Link className="text-secondary font-bold text-xs hover:underline" href="/orders">View All</Link>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden shadow-sm">
          {loading ? (
            <LoadingState label="Loading recent orders" compact />
          ) : error ? (
            <ErrorState title="Could not load your orders" message={error} onRetry={loadOrders} compact />
          ) : recent.length === 0 ? (
            <EmptyState
              compact
              icon="receipt_long"
              title="No orders yet"
              description="Place your first print order and it will appear here."
              action={<ButtonLink href="/products" size="sm" icon="storefront">Browse products</ButtonLink>}
            />
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

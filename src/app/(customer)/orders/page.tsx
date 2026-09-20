"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { statusLabel, statusBadge, statusDot } from "@/lib/orderStatus";
import { formatDate } from "@/lib/format";
import Pager from "@/components/ui/Pager";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: string[];
  placedAt: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pageSize: 50, hasMore: false });
  const [counts, setCounts] = useState({ all: 0, active: 0, completed: 0, cancelled: 0 });

  // Debounced, and a new search always starts from page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Tab, search and paging all resolve in the DB, so the tab badges and the
      // rows agree even when the history runs past one page.
      const res = await ordersApi.list({ page, bucket: tab, q: term || undefined });
      setOrders(res.orders as OrderSummary[]);
      setCounts(res.buckets);
      setMeta({ total: res.total, pageSize: res.pageSize, hasMore: res.hasMore });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, tab, term]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = orders;

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: "all", label: "All Orders", count: counts.all },
    { key: "active", label: "Current", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <>
      {/* Dark page header */}
      <section className="bg-primary-container text-white py-12 px-gutter">
        <div className="max-w-container-max mx-auto">
          <nav className="flex items-center gap-2 text-on-primary-container mb-4 font-label-caps">
            <Link className="hover:text-white transition-colors" href="/dashboard">Home</Link>
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
            <span className="text-white">My Orders</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display-lg text-white mb-2">Order History · My Orders</h1>
              <p className="text-on-primary-container max-w-2xl">Manage your high-fidelity print projects, track real-time production status, and access design assets from previous orders.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[120px]">
                <p className="font-label-caps text-on-primary-container mb-1">Total Orders</p>
                <p className="font-price-lg text-white">{loading ? "—" : counts.all}</p>
              </div>
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[100px] border-l-4 border-secondary">
                <p className="font-label-caps text-on-primary-container mb-1">Active</p>
                <p className="font-price-lg text-secondary-container">{loading ? "—" : counts.active}</p>
              </div>
              <div className="bg-white/5 navy-glow rounded-xl p-4 min-w-[100px]">
                <p className="font-label-caps text-on-primary-container mb-1">Completed</p>
                <p className="font-price-lg text-white">{loading ? "—" : counts.completed}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canvas */}
      <div className="canvas-bg px-gutter py-8">
        <div className="max-w-container-max mx-auto space-y-6">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                placeholder="Search order ID, product name, or status"
                type="text"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-outline-variant mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                className={t.key === tab
                  ? "px-6 py-4 border-b-2 border-secondary text-secondary font-bold whitespace-nowrap"
                  : "px-6 py-4 border-b-2 border-transparent text-on-surface-variant hover:text-secondary font-medium whitespace-nowrap transition-colors"}
              >
                {t.label}{loading ? "" : ` (${t.count})`}
              </button>
            ))}
          </div>

          {/* States */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm">
              <LoadingState label="Loading your orders" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-xl shadow-sm">
              <ErrorState title="Could not load orders" message={error} onRetry={load} />
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm">
              <EmptyState
                icon="receipt_long"
                title={orders.length === 0 ? "No orders yet" : "Nothing matches this filter"}
                description={
                  orders.length === 0
                    ? "Once you place an order it will appear here with its live production status."
                    : "Try another tab, or clear the search."
                }
                action={
                  orders.length === 0 ? (
                    <ButtonLink href="/products" icon="storefront">Browse products</ButtonLink>
                  ) : undefined
                }
              />
            </div>
          )}

          {/* Orders list */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-6">
              {filtered.map((o) => {
                const isCancelled = o.status === "CANCELLED";
                const border = statusDot(o.status).replace("bg-", "border-");
                return (
                  <div key={o.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${border} hover:shadow-lg transition-shadow ${isCancelled ? "opacity-75" : ""}`}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary-container text-[32px]" aria-hidden="true">
                              {isCancelled ? "cancel" : o.status === "DELIVERED" ? "check_circle" : "print"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-headline-md text-primary">#{o.orderNumber}</span>
                              <span className={`px-3 py-1 rounded-full font-label-caps ${statusBadge(o.status)}`}>{statusLabel(o.status)}</span>
                            </div>
                            <p className="text-on-surface-variant text-sm">Placed: {formatDate(o.placedAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-price-lg text-primary ${isCancelled ? "line-through text-on-surface-variant" : ""}`}>{inr(o.totalAmount)}</p>
                          <p className="text-on-surface-variant text-sm">Paid via Wallet</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {o.items.map((label, idx) => (
                          <span key={idx} className="px-3 py-1 bg-surface-variant rounded-lg text-sm text-on-surface-variant font-medium">{label}</span>
                        ))}
                        <span className="px-3 py-1 border border-outline-variant rounded-lg text-sm text-on-surface-variant">Total Items: {o.itemCount}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href={`/orders/${o.id}`} className="flex-1 py-3 border border-outline-variant rounded-lg font-button hover:bg-surface-dim transition-colors text-center">View Details</Link>
                        {!isCancelled && (
                          <ButtonLink href={`/orders/${o.id}`} className="flex-1" icon="local_shipping">Track order</ButtonLink>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && meta.total > meta.pageSize && (
            <Pager
              page={page}
              pageSize={meta.pageSize}
              total={meta.total}
              hasMore={meta.hasMore}
              onPage={setPage}
              busy={loading}
              label="orders"
            />
          )}
        </div>
      </div>
    </>
  );
}

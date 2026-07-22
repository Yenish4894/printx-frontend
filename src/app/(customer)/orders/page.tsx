"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { statusLabel, statusBadge, statusDot } from "@/lib/orderStatus";
import { formatDate } from "@/lib/format";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: string[];
  placedAt: string;
}

const COMPLETED = new Set(["DELIVERED"]);
const ACTIVE = new Set(["PLACED", "PAYMENT_CONFIRMED", "DESIGN_REVIEW", "PRINTING", "QUALITY_CHECK", "OUT_FOR_DELIVERY"]);

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersApi.list();
      setOrders(res.orders as OrderSummary[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    let active = 0, completed = 0, cancelled = 0;
    for (const o of orders) {
      if (o.status === "CANCELLED") cancelled++;
      else if (COMPLETED.has(o.status)) completed++;
      else if (ACTIVE.has(o.status)) active++;
    }
    return { all: orders.length, active, completed, cancelled };
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === "active") list = list.filter((o) => ACTIVE.has(o.status));
    else if (tab === "completed") list = list.filter((o) => COMPLETED.has(o.status));
    else if (tab === "cancelled") list = list.filter((o) => o.status === "CANCELLED");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          statusLabel(o.status).toLowerCase().includes(q) ||
          o.items.some((i) => i.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, tab, search]);

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
                onClick={() => setTab(t.key)}
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
            <div className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary text-4xl animate-spin mb-3" aria-hidden="true">progress_activity</span>
              <p className="text-on-surface-variant">Loading your orders…</p>
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center border-l-4 border-error">
              <span className="material-symbols-outlined text-error text-4xl mb-3" aria-hidden="true">error</span>
              <p className="font-bold text-primary mb-1">Could not load orders</p>
              <p className="text-on-surface-variant mb-6">{error}</p>
              <button
                onClick={load}
                className="px-8 py-3 premium-gradient text-white rounded-lg font-button shadow-md active:scale-[0.98] transition-transform"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-outline text-5xl mb-3" aria-hidden="true">receipt_long</span>
              <p className="font-headline-md text-primary mb-1">No orders here yet</p>
              <p className="text-on-surface-variant mb-6">
                {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match this filter."}
              </p>
              <Link href="/products" className="px-8 py-3 premium-gradient text-white rounded-lg font-button shadow-md">Browse Products</Link>
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
                          <Link href={`/orders/${o.id}`} className="flex-1 py-3 premium-gradient text-white rounded-lg font-button shadow-md active:scale-[0.98] transition-transform text-center">Track Order</Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

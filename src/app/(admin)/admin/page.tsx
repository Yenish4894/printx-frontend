"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { formatDateTime } from "@/lib/format";

type RecentOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  status: string;
  totalAmount: number;
  placedAt: string;
};

type Stats = {
  totalOrders: number;
  activeOrders: number;
  customers: number;
  products: number;
  revenue: number;
  pendingRefunds: number;
  ordersByStatus: Record<string, number>;
  recentOrders: RecentOrder[];
};

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-orange-100 text-orange-700",
  PAYMENT_CONFIRMED: "bg-indigo-100 text-indigo-700",
  DESIGN_REVIEW: "bg-blue-100 text-blue-700",
  PRINTING: "bg-secondary/10 text-secondary",
  QUALITY_CHECK: "bg-yellow-100 text-yellow-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { stats } = await admin.stats();
      setStats(stats);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <header className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary">Overview Dashboard</h2>
        <p className="text-on-surface-variant font-body-lg">Here&apos;s a snapshot of your printing press operations today.</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-3">progress_activity</span> Loading dashboard...
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-xl bg-error-container/30 border border-error/40 text-error flex flex-wrap items-center gap-3">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          <span>{error}</span>
          <button
            onClick={load}
            className="ml-auto inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-error/40 font-button text-sm hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="bento-grid">
          {/* Revenue */}
          <div className="col-span-4 lg:col-span-2 p-8 rounded-xl bg-primary-container text-on-primary flex flex-col justify-between overflow-hidden relative shadow-lg">
            <div className="relative z-10">
              <span className="text-label-caps font-label-caps opacity-60">Total Revenue</span>
              <div className="flex items-baseline gap-4 mt-2">
                <h3 className="font-display-lg text-display-lg text-secondary-container">{inr(stats.revenue)}</h3>
              </div>
              <p className="text-sm text-white/60 mt-2">{stats.totalOrders.toLocaleString("en-IN")} total orders placed</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-white/70 text-sm relative z-10">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">payments</span>
              Revenue excludes cancelled orders
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>

          {/* Active Orders */}
          <div className="col-span-2 lg:col-span-1 p-8 rounded-xl bg-white shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-4"><span className="material-symbols-outlined text-secondary">print</span></div>
              <span className="text-label-caps text-on-surface-variant/60 uppercase">Active Orders</span>
              <h3 className="font-headline-md text-headline-md mt-1">{stats.activeOrders.toLocaleString("en-IN")}</h3>
            </div>
            <div className="mt-4">
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-full" style={{ width: `${stats.totalOrders ? Math.min(100, Math.round((stats.activeOrders / stats.totalOrders) * 100)) : 0}%` }}></div>
              </div>
              <p className="text-xs mt-2 text-on-surface-variant">In production / fulfilment</p>
            </div>
          </div>

          {/* Customers */}
          <div className="col-span-2 lg:col-span-1 p-8 rounded-xl bg-white shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-4"><span className="material-symbols-outlined text-primary">group</span></div>
              <span className="text-label-caps text-on-surface-variant/60 uppercase">Customers</span>
              <h3 className="font-headline-md text-headline-md mt-1">{stats.customers.toLocaleString("en-IN")}</h3>
            </div>
            <p className="text-xs text-on-surface-variant font-bold mt-4">{stats.products.toLocaleString("en-IN")} active products</p>
          </div>

          {/* Order Queue */}
          <div className="col-span-4 lg:col-span-3 p-8 rounded-xl bg-white shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline-md text-headline-md">Recent Order Queue</h4>
              <Link href="/admin/orders" className="text-secondary font-button text-sm flex items-center gap-1 hover:underline">View All Orders <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant">
                  <tr>
                    {["Order #", "Client", "Placed", "Status", "Amount"].map((h) => (
                      <th key={h} className="py-4 font-label-caps text-label-caps text-on-surface-variant/60 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {stats.recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant italic">No orders yet.</td></tr>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 font-bold text-primary">
                          <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold bg-primary-container text-on-primary-container">{initials(o.customer)}</div>
                            <span>{o.customer}</span>
                          </div>
                        </td>
                        <td className="py-4 text-on-surface-variant text-sm">{formatDateTime(o.placedAt)}</td>
                        <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${STATUS_STYLES[o.status] ?? "bg-surface-container text-on-surface-variant"}`}>{statusLabel(o.status)}</span></td>
                        <td className="py-4 font-bold">{inr(o.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending refunds */}
          <Link href="/admin/refunds" className="col-span-4 lg:col-span-1 p-8 rounded-xl bg-white shadow-sm border border-outline-variant flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-4"><span className="material-symbols-outlined text-secondary">currency_exchange</span></div>
              <span className="text-label-caps text-on-surface-variant/60 uppercase">Pending Refunds</span>
              <h3 className="font-headline-md text-headline-md mt-1">{stats.pendingRefunds.toLocaleString("en-IN")}</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              {stats.pendingRefunds > 0 ? "Awaiting your review →" : "Nothing to review"}
            </p>
          </Link>
        </div>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { statusLabel, statusBadge, statusDot } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  customer: string;
  customerMobile: string;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
};

const FILTERS: { label: string; value?: string }[] = [
  { label: "All", value: undefined },
  { label: "Placed", value: "PLACED" },
  { label: "Payment Confirmed", value: "PAYMENT_CONFIRMED" },
  { label: "Design Review", value: "DESIGN_REVIEW" },
  { label: "Printing", value: "PRINTING" },
  { label: "Quality Check", value: "QUALITY_CHECK" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function initials(name: string) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { orders } = await admin.orders.list(activeFilter);
      setOrders(orders);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.customerMobile.toLowerCase().includes(q),
      )
    : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Orders Management</h1>
        <p className="font-body-md text-on-surface-variant">{visible.length.toLocaleString("en-IN")} {activeFilter ? statusLabel(activeFilter).toLowerCase() : "total"} orders</p>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-body-md bg-surface" placeholder="Search Order #, customer, phone..." type="text" />
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {FILTERS.map((f) => {
              const active = f.value === activeFilter;
              return (
                <button key={f.label} onClick={() => setActiveFilter(f.value)} className={`px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 transition-all ${active ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container-high text-on-surface-variant"}`}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {["Order #", "Customer", "Items", "Amount", "Placed Date", "Status", ""].map((h, i) => (
                  <th key={i} scope="col" className={`px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider ${h === "Items" ? "text-center" : ""} ${h === "" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant"><span className="material-symbols-outlined animate-spin align-middle mr-2" aria-hidden="true">progress_activity</span> Loading orders...</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center" role="alert">
                  <span className="material-symbols-outlined align-middle mr-2 text-error" aria-hidden="true">error</span>
                  <span className="text-error">{error}</span>
                  <button onClick={load} className="ml-3 underline font-bold text-secondary">Retry</button>
                </td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant italic">No orders found.</td></tr>
              ) : (
                visible.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4"><Link href={`/admin/orders/${r.id}`} className="font-bold text-secondary cursor-pointer hover:underline">{r.orderNumber}</Link></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">{initials(r.customer)}</div>
                          <div><p className="font-semibold text-primary">{r.customer}</p><p className="text-[11px] text-on-surface-variant">{r.customerMobile}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{r.itemCount}</td>
                      <td className="px-6 py-4 font-bold">{inr(r.totalAmount)}</td>
                      <td className="px-6 py-4 text-sm">{formatDateTime(r.placedAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadge(r.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(r.status)}`}></span>{statusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/orders/${r.id}`} aria-label={`View details for order ${r.orderNumber}`} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant inline-flex" title="View Details"><span className="material-symbols-outlined text-sm" aria-hidden="true">visibility</span></Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && visible.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-4 border-t border-outline-variant">
            <div className="text-sm text-on-surface-variant">Showing <span className="font-semibold text-primary">{visible.length.toLocaleString("en-IN")}</span> orders</div>
          </div>
        )}
      </div>
    </div>
  );
}

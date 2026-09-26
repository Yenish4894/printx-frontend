"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { statusLabel, statusBadge, statusDot } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";
import Pager from "@/components/ui/Pager";
import { EmptyState, LoadingState, ErrorState, TableState } from "@/components/ui/States";
import PageHeader from "@/components/ui/PageHeader";
import ScrollRow from "@/components/ui/ScrollRow";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  customer: string;
  customerMobile: string;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
  payment: { status: string; hasProof: boolean } | null;
};

const FILTERS: { label: string; value?: string }[] = [
  { label: "All", value: undefined },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Placed", value: "PLACED" },
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
  // Debounced so typing does not fire a query per keystroke; the search itself
  // runs in the DB, so it covers every order and not just the page on screen.
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pageSize: 50, hasMore: false });

  // Debounced, and a new search always starts from page 1 — landing on page 3
  // of a different result set would show an empty table.
  useEffect(() => {
    const t = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.orders.list(activeFilter, { page, q: term || undefined });
      setOrders(res.orders);
      setMeta({ total: res.total, pageSize: res.pageSize, hasMore: res.hasMore });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, term]);

  // Started from a timer callback, not synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const visible = orders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${meta.total.toLocaleString("en-IN")} ${activeFilter ? statusLabel(activeFilter).toLowerCase() : "total"} orders`}
        className="mb-0"
      />

      {/* Toolbar */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-body-md bg-surface" placeholder="Search Order #, customer, phone..." type="text" />
          </div>
        </div>
        <ScrollRow className="gap-2 items-center pb-1 -mx-2 px-2" ariaLabel="Order status filters">
          {FILTERS.map((f) => {
            const active = f.value === activeFilter;
            return (
              <button key={f.label} onClick={() => { setActiveFilter(f.value); setPage(1); }} className={`flex-none px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 transition-all ${active ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container-high text-on-surface-variant"}`}>
                {f.label}
              </button>
            );
          })}
        </ScrollRow>
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
                <TableState colSpan={7}><LoadingState label="Loading orders" compact /></TableState>
              ) : error ? (
                <TableState colSpan={7}><ErrorState title="Could not load orders" message={error} onRetry={load} compact /></TableState>
              ) : visible.length === 0 ? (
                <TableState colSpan={7}>
                  <EmptyState
                    compact
                    icon="receipt_long"
                    title={activeFilter || term ? "Nothing matches this view" : "No orders yet"}
                    description={
                      activeFilter || term
                        ? "Try a different status, or clear the search."
                        : "Orders placed by customers will appear here."
                    }
                  />
                </TableState>
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
                        {r.status === "PAYMENT_PENDING" && (
                          // Which unpaid orders actually need a person right now.
                          <p className={`mt-1 text-[11px] font-bold ${r.payment?.hasProof && r.payment.status === "PENDING" ? "text-secondary" : "text-on-surface-variant"}`}>
                            {r.payment?.status === "FAILED"
                              ? "Proof rejected · awaiting re-upload"
                              : r.payment?.hasProof
                                ? "Proof submitted · verify now"
                                : "Awaiting customer payment"}
                          </p>
                        )}
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
        {!loading && !error && meta.total > meta.pageSize && (
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant">
            <Pager
              page={page}
              pageSize={meta.pageSize}
              total={meta.total}
              hasMore={meta.hasMore}
              onPage={setPage}
              busy={loading}
              label="orders"
            />
          </div>
        )}
      </div>
    </div>
  );
}

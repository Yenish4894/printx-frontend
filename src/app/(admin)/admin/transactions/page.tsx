"use client";

import { useCallback, useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { formatDateTime } from "@/lib/format";

interface Txn {
  id: string;
  customer: string;
  customerMobile: string;
  type: "CREDIT" | "DEBIT" | "REFUND";
  amount: number;
  balanceAfter: number;
  reference: string | null;
  description: string | null;
  createdAt: string;
}
interface Summary {
  walletLiability: number;
  topUps: number;
  orderDebits: number;
  refunds: number;
}

const typeClass: Record<string, string> = {
  CREDIT: "bg-emerald-50 text-emerald-700",
  REFUND: "bg-sky-50 text-sky-700",
  DEBIT: "bg-red-50 text-red-700",
};

export default function AdminTransactions() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await admin.transactions.list();
      setSummary(r.summary as Summary);
      setTxns(r.transactions as Txn[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards: [string, number, string, string][] = summary
    ? [
        ["Wallet Liability", summary.walletLiability, "Total customer balances", "text-primary"],
        ["Top-ups", summary.topUps, "All wallet credits", "text-emerald-600"],
        ["Order Debits", summary.orderDebits, "Paid from wallet", "text-error"],
        ["Refunds", summary.refunds, "Credited reversals", "text-sky-600"],
      ]
    : [];

  const filtered = txns.filter(
    (t) =>
      !q ||
      t.customer.toLowerCase().includes(q.toLowerCase()) ||
      (t.reference ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Wallet &amp; Transactions</h1>
        <p className="font-body-md text-on-surface-variant">Ledger of all wallet activity across customers.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-error-container/60 text-on-error-container flex items-center justify-between gap-4" role="alert">
          <span>{error}</span>
          <button onClick={load} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(([label, value, sub, color]) => (
          <div key={label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">{label}</p>
            <div className="flex flex-col">
              <h4 className={`font-headline-md text-headline-md ${color}`}>{inr(value)}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{sub}</p>
            </div>
          </div>
        ))}
        {!summary && loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 h-28 animate-pulse" />
        ))}
      </section>

      {/* Transactions */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 bg-surface-container-low/30 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" aria-hidden="true">search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-secondary-container"
              placeholder="Search by customer/ref..."
              type="text"
            />
          </div>
          <span className="text-xs text-on-surface-variant font-medium">{filtered.length} transactions</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">{["Date", "Customer", "Type", "Amount", "Balance After", "Reference", "Description"].map((h) => (
                <th key={h} scope="col" className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant"><span className="material-symbols-outlined animate-spin align-middle mr-2" aria-hidden="true">progress_activity</span> Loading transactions…</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center" role="alert">
                  <span className="text-error">Couldn&apos;t load transactions.</span>
                  <button onClick={load} className="ml-3 underline font-bold text-secondary">Retry</button>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">{txns.length === 0 ? "No transactions yet." : "No transactions match your search."}</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium">{formatDateTime(t.createdAt)}</p></td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">{t.customer}</span>
                      <p className="text-xs text-on-surface-variant">{t.customerMobile}</p>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${typeClass[t.type] ?? "bg-surface-container text-on-surface-variant"}`}>{t.type}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-bold ${t.type === "DEBIT" ? "text-red-600" : "text-emerald-600"}`}>{t.type === "DEBIT" ? "−" : "+"}{inr(t.amount)}</span></td>
                    <td className="px-6 py-4 text-sm font-medium">{inr(t.balanceAfter)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{t.reference ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{t.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

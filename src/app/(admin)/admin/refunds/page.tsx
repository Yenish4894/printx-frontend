"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import { statusLabel, statusBadge, REFUND_STATUS } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";

type Refund = {
  id: string;
  orderNumber: string;
  customer: string;
  customerMobile: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "CREDITED" | "REJECTED" | string;
  reason: string | null;
  createdAt: string;
  processedAt: string | null;
};

const STATUS_TABS = ["All", "PENDING", "PROCESSING", "CREDITED", "REJECTED"] as const;

export default function AdminRefunds() {
  const confirm = useConfirm();
  const toast = useToast();

  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_TABS)[number]>("All");
  const [busyKey, setBusyKey] = useState<string | null>(null); // `${id}:${action}`

  // Inline reject flow
  const [rejectTarget, setRejectTarget] = useState<Refund | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const { refunds } = await admin.refunds.list();
      setRefunds(refunds as Refund[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load refunds");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (r: Refund) => {
    const ok = await confirm({
      title: "Approve this refund?",
      message: `${inr(r.amount)} will be credited to the customer's wallet.`,
      confirmLabel: "Approve refund",
    });
    if (!ok) return;
    setBusyKey(`${r.id}:APPROVE`);
    setError(null);
    try {
      await admin.refunds.process(r.id, "APPROVE", undefined);
      await load({ silent: true });
      toast("Refund approved", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to process refund";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const openReject = (r: Refund) => {
    setRejectTarget(r);
    setRejectReason("");
    setRejectError(null);
  };

  const rejectSaving = busyKey === `${rejectTarget?.id}:REJECT`;

  const submitReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("A reason is required to reject a refund.");
      return;
    }
    setBusyKey(`${rejectTarget.id}:REJECT`);
    setRejectError(null);
    setError(null);
    try {
      await admin.refunds.process(rejectTarget.id, "REJECT", reason);
      setRejectTarget(null);
      await load({ silent: true });
      toast("Refund rejected", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to process refund";
      setRejectError(msg);
      toast(msg, "error");
    } finally {
      setBusyKey(null);
    }
  };

  useEffect(() => {
    if (!rejectTarget) return;
    rejectRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !rejectSaving) setRejectTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rejectTarget, rejectSaving]);

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === "All" ? refunds.length : refunds.filter((r) => r.status === t).length;
    return acc;
  }, {});

  const visible = filter === "All" ? refunds : refunds.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Refunds</h1>
        <p className="font-body-md text-on-surface-variant">{refunds.length} total refund requests</p>
      </div>

      <div className="flex items-center gap-2 border-b border-outline-variant overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((label) => {
          const active = filter === label;
          return (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`px-6 py-3 whitespace-nowrap font-button text-sm flex items-center gap-2 border-b-2 transition-colors capitalize ${active ? "border-secondary text-secondary font-bold" : "border-transparent text-on-surface-variant hover:text-secondary"}`}
            >
              {label.toLowerCase()}{" "}
              <span className={`px-2 rounded-full text-xs ${active ? "bg-secondary/10" : "bg-surface-variant/50"}`}>{counts[label]}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-error/10 text-error text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => load()} className="underline font-bold">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {["Order #", "Customer", "Amount", "Reason", "Requested", "Processed", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className={`px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase ${h === "Status" ? "text-center" : ""} ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-on-surface-variant">Loading refunds…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-on-surface-variant">No refunds found.</td></tr>
              ) : (
                visible.map((r) => {
                  const actionable = r.status === "PENDING" || r.status === "PROCESSING";
                  return (
                    <tr key={r.id} className={`hover:bg-surface-bright transition-colors group ${!actionable ? "opacity-80" : ""}`}>
                      <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary">{r.orderNumber}</td>
                      <td className="px-6 py-5">
                        <div className="font-body-md text-body-md text-on-surface">{r.customer}</div>
                        <div className="text-xs text-on-surface-variant">{r.customerMobile}</div>
                      </td>
                      <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary">{inr(r.amount)}</td>
                      <td className="px-6 py-5"><p className="text-body-md text-on-surface-variant max-w-[200px] truncate" title={r.reason ?? ""}>{r.reason ?? "—"}</p></td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDateTime(r.createdAt)}</td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDateTime(r.processedAt)}</td>
                      <td className="px-6 py-5 text-center"><span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-bold ${statusBadge(r.status, REFUND_STATUS)}`}>{statusLabel(r.status, REFUND_STATUS)}</span></td>
                      <td className="px-6 py-5 text-right">
                        {actionable ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={busyKey === `${r.id}:APPROVE` || busyKey === `${r.id}:REJECT`}
                              onClick={() => approve(r)}
                              className="px-4 py-1.5 primary-gradient text-white rounded font-button text-[14px] disabled:opacity-50"
                            >
                              {busyKey === `${r.id}:APPROVE` ? "…" : "Approve"}
                            </button>
                            <button
                              disabled={busyKey === `${r.id}:APPROVE` || busyKey === `${r.id}:REJECT`}
                              onClick={() => openReject(r)}
                              className="px-4 py-1.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded font-button text-[14px] disabled:opacity-50"
                            >
                              {busyKey === `${r.id}:REJECT` ? "…" : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant/60 uppercase font-bold">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-caps text-on-surface-variant">Showing {visible.length} of {refunds.length} results</p>
        </div>
      </div>

      {/* Reject refund dialog */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => { if (!rejectSaving) setRejectTarget(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-refund-title"
            className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 id="reject-refund-title" className="font-headline-md text-headline-md text-on-surface mb-2">Reject refund</h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                Rejecting the {inr(rejectTarget.amount)} refund for order {rejectTarget.orderNumber}. The reason is shared with the customer.
              </p>
              <label htmlFor="reject-refund-reason" className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Reason for rejection</label>
              <textarea
                id="reject-refund-reason"
                ref={rejectRef}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={rejectSaving}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-secondary h-24 placeholder:italic disabled:opacity-50"
                placeholder="e.g. Order already shipped; refund not applicable."
              />
              {rejectError && <p className="text-error text-xs mt-2" role="alert">{rejectError}</p>}
            </div>
            <div className="px-6 py-4 bg-surface-container flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={rejectSaving}
                className="px-5 py-2.5 rounded-lg border border-outline-variant font-button text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={rejectSaving}
                className="px-5 py-2.5 rounded-lg font-button text-white bg-error hover:brightness-95 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {rejectSaving && <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>}
                Reject refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

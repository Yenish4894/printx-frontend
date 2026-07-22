"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import { statusLabel, statusBadge, nextStatuses, REFUND_STATUS } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";

const FILE_STATUS_STYLES: Record<string, string> = {
  UPLOADED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-surface-container text-on-surface-variant",
  MISSING: "bg-surface-container text-on-surface-variant",
};

type Item = {
  id: string;
  productName: string;
  quantity: number;
  specSnapshot: unknown;
  unitPrice: number;
  lineSubtotal: number;
  gstAmount: number;
  deliveryEtaLabel: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileStatus: string | null;
  fileRejectReason: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: string;
  customer: { id: string; businessName: string; ownerName: string; mobile: string; email: string };
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  shipping: unknown;
  notes: string | null;
  placedAt: string;
  items: Item[];
  statusHistory: { status: string; note: string | null; at: string }[];
  refunds: { id: string; amount: number; status: string; reason: string | null }[];
  payment: { method: string; status: string; amount: number } | null;
};

function specEntries(spec: unknown): [string, string][] {
  if (!spec || typeof spec !== "object") return [];
  const out: [string, string][] = [];
  for (const [k, v] of Object.entries(spec as Record<string, unknown>)) {
    if (v == null) continue;
    let val: string;
    if (Array.isArray(v)) val = v.join(", ");
    else if (typeof v === "object") val = JSON.stringify(v);
    else val = String(v);
    out.push([statusLabel(k), val]);
  }
  return out;
}

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const confirm = useConfirm();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState<string | null>(null); // `${itemId}:${action}`
  const [actionError, setActionError] = useState<string | null>(null);

  // Inline reject-artwork flow
  const [rejectItemId, setRejectItemId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const { order } = await admin.orders.get(id);
      setOrder(order);
      setNewStatus(order.status);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load order");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus() {
    if (!order || newStatus === order.status) return;
    // Guard cancellation (or any non-forward move) with an explicit confirm.
    if (newStatus === "CANCELLED") {
      const ok = await confirm({
        title: "Cancel this order?",
        message: "The customer will be refunded in full.",
        confirmLabel: "Cancel order",
        danger: true,
      });
      if (!ok) return;
    }
    setStatusBusy(true);
    setActionError(null);
    try {
      await admin.orders.setStatus(id, newStatus, note.trim() || undefined);
      setNote("");
      await load({ silent: true });
      toast("Order status updated", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to update status";
      setActionError(msg);
      toast(msg, "error");
    } finally {
      setStatusBusy(false);
    }
  }

  async function approveFile(itemId: string) {
    setFileBusy(`${itemId}:APPROVE`);
    setActionError(null);
    try {
      await admin.orders.reviewFile(id, itemId, "APPROVE");
      await load({ silent: true });
      toast("Artwork approved", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to review file";
      setActionError(msg);
      toast(msg, "error");
    } finally {
      setFileBusy(null);
    }
  }

  function openReject(itemId: string) {
    setRejectItemId(itemId);
    setRejectReason("");
    setRejectError(null);
  }

  async function submitReject() {
    if (!rejectItemId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("A reason is required so the customer knows what to fix.");
      return;
    }
    setFileBusy(`${rejectItemId}:REJECT`);
    setRejectError(null);
    setActionError(null);
    try {
      await admin.orders.reviewFile(id, rejectItemId, "REJECT", reason);
      setRejectItemId(null);
      await load({ silent: true });
      toast("Artwork rejected", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to review file";
      setRejectError(msg);
      toast(msg, "error");
    } finally {
      setFileBusy(null);
    }
  }

  // Reject dialog: focus the textarea, Esc closes (unless saving).
  const rejectSaving = fileBusy === `${rejectItemId}:REJECT`;
  useEffect(() => {
    if (!rejectItemId) return;
    rejectRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !rejectSaving) setRejectItemId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rejectItemId, rejectSaving]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-3" aria-hidden="true">progress_activity</span> Loading order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg">
        <Link className="text-secondary hover:underline text-sm flex items-center gap-1 mb-4" href="/admin/orders"><span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span> Back to Orders</Link>
        <div className="p-6 rounded-xl bg-error-container/30 border border-error/40 text-error flex items-center gap-3" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          <span>{error ?? "Order not found"}</span>
          <button onClick={() => load()} className="ml-auto underline font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps mb-2">
            <Link className="hover:text-secondary" href="/admin/orders">Orders</Link>
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
            <span className="text-on-surface">{order.orderNumber}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-primary">Order {order.orderNumber}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
          </div>
          {order.invoiceNumber && <p className="text-sm text-on-surface-variant mt-1">Invoice: {order.invoiceNumber}</p>}
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const options = nextStatuses(order.status);
            const terminal = options.length === 0;
            return (
              <>
                <label htmlFor="order-status-select" className="sr-only">Change order status</label>
                <select
                  id="order-status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={statusBusy || terminal}
                  className="text-sm border border-outline-variant rounded-lg bg-white px-3 py-2 focus:ring-secondary disabled:opacity-50"
                >
                  <option value={order.status} disabled>{statusLabel(order.status)} (current)</option>
                  {options.map((s) => (
                    <option key={s} value={s}>{s === "CANCELLED" ? "Cancel order" : statusLabel(s)}</option>
                  ))}
                </select>
                <button onClick={changeStatus} disabled={statusBusy || terminal || newStatus === order.status} className="bg-primary text-white px-5 py-2 rounded-lg font-button text-sm hover:opacity-90 transition-opacity disabled:opacity-40 inline-flex items-center gap-2">
                  {statusBusy && <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>}
                  Update Status
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-lg bg-error-container/30 border border-error/40 text-error flex items-center gap-2 text-sm" role="alert">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span> {actionError}
        </div>
      )}

      <div className="grid grid-cols-12 gap-5 sm:gap-8 pb-12">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Status change note + timeline */}
          <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
            <h3 className="font-headline-md text-lg text-primary mb-6">Status &amp; History</h3>
            <div className="mb-8">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Note for next status change (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-secondary h-20 placeholder:italic" placeholder="Add a note customers and staff will see with the status update..."></textarea>
            </div>
            <div className="space-y-0 border-t border-outline-variant/30 pt-6">
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No history yet.</p>
              ) : (
                [...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-4 pb-6 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${i === 0 ? "bg-secondary ring-4 ring-secondary/20" : "bg-outline-variant"}`}></div>
                      {i < order.statusHistory.length - 1 && <div className="w-px flex-grow bg-outline-variant/50 my-1"></div>}
                    </div>
                    <div className="flex-grow -mt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${statusBadge(h.status)}`}>{statusLabel(h.status)}</span>
                        <span className="text-[11px] text-on-surface-variant">{formatDateTime(h.at)}</span>
                      </div>
                      {h.note && <p className="text-sm text-on-surface mt-1">{h.note}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Order items */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="px-5 sm:px-8 py-5 bg-surface-container border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-lg text-primary uppercase tracking-tight">Order Items &amp; Configuration</h3>
              <span className="text-sm font-medium text-on-surface-variant">{order.items.length} Item{order.items.length === 1 ? "" : "s"}</span>
            </div>
            {order.items.map((item) => {
              const specs = specEntries(item.specSnapshot);
              const canReview = !!item.fileUrl && item.fileStatus === "UPLOADED";
              return (
                <div key={item.id} className="p-5 sm:p-8 border-b border-outline-variant/30 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h4 className="font-headline-md text-lg text-primary">{item.productName}</h4>
                          {item.fileStatus && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${FILE_STATUS_STYLES[item.fileStatus] ?? "bg-surface-container text-on-surface-variant"}`}>{statusLabel(item.fileStatus)}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-y-2">
                          <div className="flex flex-col"><span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Quantity</span><span className="text-sm font-medium">{item.quantity}</span></div>
                          {item.deliveryEtaLabel && (
                            <div className="flex flex-col"><span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Delivery</span><span className="text-sm font-medium">{item.deliveryEtaLabel}</span></div>
                          )}
                          {specs.map(([k, v]) => (
                            <div key={k} className="flex flex-col"><span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{k}</span><span className="text-sm font-medium">{v}</span></div>
                          ))}
                        </div>
                        {/* File */}
                        <div className="mt-4">
                          {item.fileUrl ? (
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-secondary hover:underline">
                              <span className="material-symbols-outlined text-sm" aria-hidden="true">description</span>
                              {item.fileName ?? "View uploaded artwork"}
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm text-error"><span className="material-symbols-outlined text-sm" aria-hidden="true">warning</span> No artwork uploaded</span>
                          )}
                          {item.fileStatus === "REJECTED" && item.fileRejectReason && (
                            <p className="text-xs text-error mt-1">Rejected: {item.fileRejectReason}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <div><p className="text-[10px] text-on-surface-variant uppercase font-bold">Unit Price</p><p className="text-lg font-bold">{inr(item.unitPrice)}</p></div>
                        <div className="pt-4 border-t border-outline-variant/20">
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold">Line Subtotal</p><p className="text-xl font-extrabold text-secondary">{inr(item.lineSubtotal)}</p>
                          <p className="text-[11px] text-on-surface-variant mt-1">+ {inr(item.gstAmount)} GST</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {canReview && (
                    <div className="mt-6 flex justify-end gap-4">
                      <button onClick={() => openReject(item.id)} disabled={fileBusy?.startsWith(`${item.id}:`)} className="px-6 py-2 border border-error text-error font-button text-sm rounded-lg hover:bg-error/5 transition-colors disabled:opacity-40 inline-flex items-center gap-2">
                        {fileBusy === `${item.id}:REJECT` && <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>}
                        Reject Artwork
                      </button>
                      <button onClick={() => approveFile(item.id)} disabled={fileBusy?.startsWith(`${item.id}:`)} className="px-6 py-2 bg-secondary/10 text-secondary border border-secondary font-button text-sm rounded-lg hover:bg-secondary/20 transition-colors disabled:opacity-40 inline-flex items-center gap-2">
                        {fileBusy === `${item.id}:APPROVE` && <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>}
                        Approve Files
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        {/* Right */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Customer */}
          <section className="bg-primary-container p-5 sm:p-8 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-secondary bg-secondary/20 flex items-center justify-center text-white text-xl font-bold">
                  {(order.customer.businessName || order.customer.ownerName || "?").slice(0, 2).toUpperCase()}
                </div>
                <div><h4 className="text-white font-headline-lg text-xl">{order.customer.businessName}</h4><p className="text-on-primary-container/70 text-sm">{order.customer.ownerName}</p></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm" aria-hidden="true">mail</span><span className="text-on-primary-container/90 text-sm break-all">{order.customer.email}</span></div>
                <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm" aria-hidden="true">call</span><span className="text-on-primary-container/90 text-sm">{order.customer.mobile}</span></div>
                {order.notes && (
                  <div className="flex items-start gap-3"><span className="material-symbols-outlined text-secondary text-sm" aria-hidden="true">sticky_note_2</span><span className="text-on-primary-container/90 text-sm">{order.notes}</span></div>
                )}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
            <h3 className="font-headline-md text-lg text-primary mb-6 uppercase tracking-tight">Payment Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Subtotal</span><span className="font-medium">{inr(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Delivery Charge</span><span className="font-medium">{inr(order.deliveryCharge)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-on-surface-variant">GST</span><span className="font-medium">{inr(order.gstAmount)}</span></div>
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center"><span className="font-bold text-primary">Grand Total</span><span className="font-price-lg text-price-lg text-secondary">{inr(order.totalAmount)}</span></div>
            </div>
            {order.payment && (
              <div className="text-sm bg-surface-container-low rounded-lg p-3 flex items-center justify-between">
                <span className="text-on-surface-variant">{order.payment.method} · {statusLabel(order.payment.status)}</span>
                <span className="font-medium">{inr(order.payment.amount)}</span>
              </div>
            )}
          </section>

          {/* Refunds */}
          {order.refunds.length > 0 && (
            <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
              <h3 className="font-headline-md text-lg text-primary mb-4 uppercase tracking-tight">Refunds</h3>
              <div className="space-y-3">
                {order.refunds.map((r) => (
                  <div key={r.id} className="flex justify-between items-center text-sm bg-surface-container-low rounded-lg p-3">
                    <div>
                      <p className="font-medium">{inr(r.amount)}</p>
                      {r.reason && <p className="text-[11px] text-on-surface-variant">{r.reason}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${statusBadge(r.status, REFUND_STATUS)}`}>{statusLabel(r.status, REFUND_STATUS)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="text-xs text-on-surface-variant px-2">Placed on {formatDateTime(order.placedAt)}</div>
        </div>
      </div>

      {/* Reject artwork dialog */}
      {rejectItemId && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => { if (!rejectSaving) setRejectItemId(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
            className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 id="reject-title" className="font-headline-md text-headline-md text-on-surface mb-2">Reject artwork</h3>
              <p className="text-body-md text-on-surface-variant mb-4">Tell the customer what needs to change. This reason will be shown to them.</p>
              <label htmlFor="reject-reason" className="font-label-caps text-label-caps text-on-surface-variant block mb-2 uppercase">Reason for rejection</label>
              <textarea
                id="reject-reason"
                ref={rejectRef}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={rejectSaving}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-secondary h-24 placeholder:italic disabled:opacity-50"
                placeholder="e.g. Artwork resolution is below 300 DPI; please re-upload a print-ready file."
              />
              {rejectError && <p className="text-error text-xs mt-2" role="alert">{rejectError}</p>}
            </div>
            <div className="px-6 py-4 bg-surface-container flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectItemId(null)}
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
                Reject artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

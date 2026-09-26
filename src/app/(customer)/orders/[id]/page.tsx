"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import {
  statusLabel,
  statusBadge,
  statusDot,
  isCancellable,
  needsArtwork,
  fileStatusLabel,
} from "@/lib/orderStatus";
import { formatDateTime, specEntries } from "@/lib/format";
import Button from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import PaymentPanel, { type PaymentInfo, type BankDetails } from "@/components/customer/PaymentPanel";
import { REFUND_STATUS } from "@/lib/orderStatus";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  specSnapshot: unknown;
  unitPrice: number;
  lineSubtotal: number;
  deliveryEtaLabel: string | null;
  fileStatus: string | null;
  fileName: string | null;
  fileRejectReason: string | null;
}

interface Shipping {
  label?: string;
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null; // issued when payment is verified
  status: string;
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  shipping: Shipping | null;
  notes: string | null;
  placedAt: string;
  items: OrderItem[];
  statusHistory: { status: string; note: string | null; at: string }[];
  payment: (PaymentInfo & { method: string }) | null;
  bankDetails: BankDetails | null;
  refunds: { amount: number; status: string; reason: string | null; processedAt: string | null }[];
}

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const confirm = useConfirm();
  const toast = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersApi.get(id);
      setOrder(res.order as OrderDetail);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel() {
    if (!order) return;
    // Money was taken only if the payment was verified; otherwise nothing to refund.
    const paid = order.payment?.status === "SUCCESS";
    const ok = await confirm({
      title: "Cancel this order?",
      message: paid
        ? `We'll refund ${inr(order.totalAmount)} to your bank account.`
        : "No payment has been verified for this order, so nothing will be charged.",
      confirmLabel: "Cancel order",
      cancelLabel: "Keep order",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setCancelling(true);
    try {
      const { order: result } = await ordersApi.cancel(id);
      await load();
      // From the server's answer, not the page: the payment may have been
      // approved after this page loaded.
      toast(
        result?.refundPending ? "Order cancelled. Your refund is on its way to your bank account." : "Order cancelled.",
        "success",
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to cancel order";
      setActionError(msg);
      toast(msg, "error");
    } finally {
      setCancelling(false);
    }
  }

  async function handleUpload(itemId: string, file: File | undefined) {
    if (!file) return;
    setActionError(null);
    setUploadingItem(itemId);
    try {
      await ordersApi.uploadItemFile(id, itemId, file);
      await load();
      toast("Artwork uploaded successfully.", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to upload file";
      setActionError(msg);
      toast(msg, "error");
    } finally {
      setUploadingItem(null);
    }
  }

  if (loading) {
    return (
      <main className="pb-12 px-margin-desktop max-w-container-max mx-auto pt-8">
        <div className="bg-surface-container-lowest rounded-xl premium-shadow p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-4xl animate-spin mb-3" aria-hidden="true">progress_activity</span>
          <p className="text-on-surface-variant">Loading order…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pb-12 px-margin-desktop max-w-container-max mx-auto pt-8">
        <Link href="/orders" className="flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 group w-fit">
          <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true">arrow_back</span>
          <span className="font-button text-button">Back to Orders</span>
        </Link>
        <div className="bg-surface-container-lowest rounded-xl premium-shadow">
          <ErrorState title="Could not load order" message={error ?? "Order not found"} onRetry={load} />
        </div>
      </main>
    );
  }

  // Not while we're checking a proof: the money has probably been sent, so
  // the team settles the proof first (the server enforces the same rule).
  const proofInReview = order.status === "PAYMENT_PENDING" && order.payment?.status === "PENDING" && !!order.payment.proofUrl;
  const canCancel = isCancellable(order.status) && !proofInReview;
  const awaitingPayment = order.status === "PAYMENT_PENDING";
  const paid = order.payment?.status === "SUCCESS";
  const s = order.shipping ?? {};

  return (
    <main className="pb-12 px-margin-desktop max-w-container-max mx-auto pt-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 group w-fit">
          <span aria-hidden="true" className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-button text-button">Back to Orders</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-headline-lg font-headline-lg">Order #{order.orderNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-label-caps font-label-caps flex items-center ${statusBadge(order.status)}`}>
                {statusLabel(order.status)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-on-surface-variant text-body-md font-body-md">
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1" aria-hidden="true">calendar_today</span> Ordered {formatDateTime(order.placedAt)}</span>
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1" aria-hidden="true">layers</span> {order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="bg-primary-container text-white p-4 px-6 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-caps font-label-caps opacity-70">
                {awaitingPayment ? "AMOUNT DUE" : order.status === "CANCELLED" ? "ORDER TOTAL" : "TOTAL PAID"}
              </p>
              <p className="text-headline-md font-headline-md">{inr(order.totalAmount)}</p>
            </div>
            <span className="material-symbols-outlined text-secondary text-3xl" style={fill1} aria-hidden="true">
              {awaitingPayment ? "pending" : order.status === "CANCELLED" ? "cancel" : "check_circle"}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div role="alert" className="mb-6 bg-error-container/40 border border-error/20 text-on-error-container rounded-lg p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" aria-hidden="true">error</span>
          <span>{actionError}</span>
        </div>
      )}

      {awaitingPayment && (
        <div className="mb-gutter">
          <PaymentPanel
            orderId={order.id}
            orderNumber={order.orderNumber}
            amount={order.totalAmount}
            payment={order.payment}
            bank={order.bankDetails}
            onUpdated={(o) => setOrder(o as OrderDetail)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left */}
        <div className="lg:col-span-2 space-y-gutter">
          {/* Status timeline */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="p-gutter border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-headline-md font-headline-md">Order Status</h2>
            </div>
            <div className="p-gutter">
              {order.statusHistory.length === 0 ? (
                <p className="text-on-surface-variant">No status updates yet.</p>
              ) : (
                <div className="relative pl-8 space-y-8">
                  <div className="status-timeline-line"></div>
                  {order.statusHistory.map((h, i) => {
                    // Payment events share the PAYMENT_PENDING status, so the
                    // note (written by the server, not the user) says what
                    // happened. A rejection must not wear a checkmark.
                    const rejected = h.status === "PAYMENT_PENDING" && !!h.note?.startsWith("Payment proof rejected");
                    const uploaded = h.status === "PAYMENT_PENDING" && !!h.note?.match(/proof uploaded$/i);
                    const icon =
                      h.status === "CANCELLED" || rejected ? "close"
                        : uploaded ? "upload"
                        : h.status === "PAYMENT_PENDING" ? "schedule"
                        : "check";
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[29px] top-0 ${rejected ? "bg-red-500" : statusDot(h.status)} text-white rounded-full h-6 w-6 flex items-center justify-center z-10 shadow-sm`}>
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{icon}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-body-lg">{rejected ? "Payment proof rejected" : statusLabel(h.status)}</h3>
                            {h.note && (
                              <p className="text-on-surface-variant text-body-md">
                                {rejected ? h.note.replace(/^Payment proof rejected:\s*/, "") : h.note}
                              </p>
                            )}
                          </div>
                          <span className="text-label-caps font-label-caps text-on-surface-variant whitespace-nowrap">{formatDateTime(h.at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="space-y-6">
            <h2 className="text-headline-md font-headline-md">Order Items &amp; Configuration</h2>
            {order.items.map((it) => {
              // Was comparing against "PENDING", which is not a FileStatus value
              // (it is UPLOAD_PENDING). Items still awaiting artwork therefore
              // rendered as complete and hid their own upload button.
              const needsFile = needsArtwork(it.fileStatus);
              const rejected = it.fileStatus === "REJECTED";
              const specs = specEntries(it.specSnapshot);
              return (
                <div key={it.id} className={`bg-surface-container-lowest rounded-xl premium-shadow p-6 border-l-4 ${rejected ? "border-error" : needsFile ? "border-amber-500" : "border-green-500"}`}>
                  <div className="grow">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-body-lg font-bold">{it.quantity} × {it.productName}</h3>
                      <span className="text-right">
                        <span className="block font-bold text-body-md text-primary">{inr(it.lineSubtotal)}</span>
                        <span className="block text-label-caps text-on-surface-variant">{inr(it.unitPrice)}/unit</span>
                      </span>
                    </div>
                    {specs.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-md text-on-surface-variant mb-4">
                        {specs.map(([k, v]) => (
                          <div key={k}><span className="text-label-caps block opacity-60 uppercase">{k}</span> {v}</div>
                        ))}
                      </div>
                    )}
                    {it.deliveryEtaLabel && (
                      <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">local_shipping</span> {it.deliveryEtaLabel}
                      </p>
                    )}

                    {/* File state */}
                    <div className="pt-4 border-t border-outline-variant">
                      {it.fileStatus && !needsFile && (
                        <p className="flex items-center gap-2 text-green-700 font-medium text-body-md">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
                          {it.fileName
                            ? `${it.fileName} · ${fileStatusLabel(it.fileStatus)}`
                            : fileStatusLabel(it.fileStatus)}
                        </p>
                      )}
                      {rejected && it.fileRejectReason && (
                        <p className="mb-3 flex items-start gap-2 text-error text-body-md">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">warning</span>
                          Rejected: {it.fileRejectReason}
                        </p>
                      )}
                      {needsFile && (
                        <div>
                          <input
                            ref={(el) => { fileInputs.current[it.id] = el; }}
                            type="file"
                            accept=".pdf,.ai,.psd,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => handleUpload(it.id, e.target.files?.[0])}
                          />
                          <Button
                            onClick={() => fileInputs.current[it.id]?.click()}
                            loading={uploadingItem === it.id}
                            icon="upload"
                          >
                            {uploadingItem === it.id ? "Uploading…" : rejected ? "Re-upload file" : "Upload file"}
                          </Button>
                          <p className="text-label-caps font-label-caps text-on-surface-variant mt-2 uppercase">PDF, AI, PSD, PNG or JPG</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* Right */}
        <div className="space-y-gutter">
          {/* Invoice */}
          <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-body-lg font-bold">Invoice &amp; Payment</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <span className="text-on-surface-variant text-body-md">Invoice Number</span>
                <span className="font-bold text-body-md">
                  {order.invoiceNumber ? `#${order.invoiceNumber}` : <span className="font-normal text-on-surface-variant">Issued after payment</span>}
                </span>
              </div>
              <div className="space-y-3 mb-6">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-body-md"><span className="text-on-surface-variant">{it.quantity} × {it.productName}</span><span>{inr(it.lineSubtotal)}</span></div>
                ))}
              </div>
              <div className="pt-6 border-t border-outline-variant space-y-3 mb-6">
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Subtotal</span><span>{inr(order.subtotal)}</span></div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Shipping</span>
                  {order.deliveryCharge > 0 ? <span>{inr(order.deliveryCharge)}</span> : <span className="text-success font-bold uppercase text-xs">FREE</span>}
                </div>
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">GST (18%)</span><span>{inr(order.gstAmount)}</span></div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-body-lg">{paid ? "Total Paid" : "Total"}</span>
                <span className="text-headline-md font-headline-md text-primary">{inr(order.totalAmount)}</span>
              </div>
              <div className="bg-surface-container rounded-lg p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" style={fill1} aria-hidden="true">account_balance</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">
                  {paid
                    ? "PAID BY BANK TRANSFER"
                    : awaitingPayment
                      ? "AWAITING BANK TRANSFER"
                      : "NO PAYMENT TAKEN"}
                </span>
              </div>
              {order.refunds.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {order.refunds.map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 p-3">
                      <span className="text-body-md">
                        Refund {inr(r.amount)}
                        <span className="block text-xs text-on-surface-variant">
                          {r.status === "CREDITED"
                            ? `Sent to your bank account${r.processedAt ? ` · ${formatDateTime(r.processedAt)}` : ""}`
                            : r.status === "REJECTED"
                              ? r.reason ?? "Declined"
                              : "We'll transfer it to your bank account"}
                        </span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${REFUND_STATUS[r.status]?.badge ?? ""}`}>
                        {statusLabel(r.status, REFUND_STATUS)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Delivery / shipping */}
          {order.shipping && (
            <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6">
              <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-4">DELIVERY INFORMATION</h3>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-surface-container rounded-full flex items-center justify-center text-secondary"><span className="material-symbols-outlined" aria-hidden="true">location_on</span></div>
                <div>
                  {s.name && <p className="font-bold text-body-md">{s.name}</p>}
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {[s.line1, s.line2].filter(Boolean).join(", ")}
                    {(s.line1 || s.line2) && <br />}
                    {[s.city, s.state, s.pincode].filter(Boolean).join(", ")}
                  </p>
                  {s.phone && <p className="text-on-surface-variant text-sm mt-1">Tel: {s.phone}</p>}
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          {order.notes && (
            <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6">
              <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-2">ORDER NOTES</h3>
              <p className="text-body-md text-on-surface">{order.notes}</p>
            </section>
          )}

          {/* Cancel */}
          {canCancel && (
            <section className="bg-white rounded-xl premium-shadow p-6">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex flex-col items-center justify-center p-4 rounded-lg border border-error/20 text-error hover:bg-error/5 transition-colors disabled:opacity-60"
              >
                <span className="font-bold text-body-md">{cancelling ? "Cancelling…" : "Cancel Order"}</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70 mt-1">
                  {paid ? "Full refund to your bank account" : "No charge — payment not yet verified"}
                </span>
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

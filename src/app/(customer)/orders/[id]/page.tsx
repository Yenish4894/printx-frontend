"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import { statusLabel, statusBadge, statusDot, isCancellable } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";

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
  invoiceNumber: string;
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
}

function specEntries(spec: unknown): [string, string][] {
  if (!spec || typeof spec !== "object") return [];
  return Object.entries(spec as Record<string, unknown>)
    .filter(([, v]) => v != null && typeof v !== "object")
    .map(([k, v]) => [k, String(v)]);
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
    const ok = await confirm({
      title: "Cancel this order?",
      message: "The full amount will be refunded to your wallet.",
      confirmLabel: "Cancel order",
      cancelLabel: "Keep order",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      await load();
      toast("Order cancelled — amount refunded to your wallet.", "success");
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
        <div role="alert" className="bg-surface-container-lowest rounded-xl premium-shadow p-16 flex flex-col items-center justify-center text-center border-l-4 border-error">
          <span className="material-symbols-outlined text-error text-4xl mb-3" aria-hidden="true">error</span>
          <p className="font-bold text-primary mb-1">Could not load order</p>
          <p className="text-on-surface-variant mb-6">{error ?? "Order not found"}</p>
          <button
            onClick={load}
            className="px-8 py-3 premium-gradient text-white rounded-lg font-button shadow-md active:scale-[0.98] transition-transform"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const canCancel = isCancellable(order.status);
  const s = order.shipping ?? {};

  return (
    <main className="pb-12 px-margin-desktop max-w-container-max mx-auto pt-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 group w-fit">
          <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
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
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1" aria-hidden="true">calendar_today</span> Placed {formatDateTime(order.placedAt)}</span>
              <span className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1" aria-hidden="true">layers</span> {order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="bg-primary-container text-white p-4 px-6 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-caps font-label-caps opacity-70">TOTAL PAID</p>
              <p className="text-headline-md font-headline-md">{inr(order.totalAmount)}</p>
            </div>
            <span className="material-symbols-outlined text-secondary text-3xl" style={fill1} aria-hidden="true">check_circle</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div role="alert" className="mb-6 bg-error-container/40 border border-error/20 text-on-error-container rounded-lg p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" aria-hidden="true">error</span>
          <span>{actionError}</span>
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
                    const isCancelledStep = h.status === "CANCELLED";
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[29px] top-0 ${statusDot(h.status)} text-white rounded-full h-6 w-6 flex items-center justify-center z-10 shadow-sm`}>
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{isCancelledStep ? "close" : "check"}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-body-lg">{statusLabel(h.status)}</h4>
                            {h.note && <p className="text-on-surface-variant text-body-md">{h.note}</p>}
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
              const needsFile = !it.fileStatus || it.fileStatus === "REJECTED" || it.fileStatus === "PENDING";
              const rejected = it.fileStatus === "REJECTED";
              const specs = specEntries(it.specSnapshot);
              return (
                <div key={it.id} className={`bg-surface-container-lowest rounded-xl premium-shadow p-6 border-l-4 ${rejected ? "border-error" : needsFile ? "border-amber-500" : "border-green-500"}`}>
                  <div className="flex-grow">
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
                          {it.fileName ? `${it.fileName} (${it.fileStatus})` : `File ${it.fileStatus}`}
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
                          <button
                            onClick={() => fileInputs.current[it.id]?.click()}
                            disabled={uploadingItem === it.id}
                            className="coral-gradient text-white px-6 py-2 rounded-lg font-button text-button shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-60"
                          >
                            <span className={`material-symbols-outlined${uploadingItem === it.id ? " animate-spin" : ""}`} aria-hidden="true">{uploadingItem === it.id ? "progress_activity" : "upload"}</span>
                            {uploadingItem === it.id ? "Uploading…" : rejected ? "Re-upload File" : "Upload File"}
                          </button>
                          <p className="text-label-caps font-label-caps text-outline mt-2 uppercase">PDF, AI, PSD, PNG or JPG</p>
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
              <div className="flex justify-between mb-6"><span className="text-on-surface-variant text-body-md">Invoice Number</span><span className="font-bold text-body-md">#{order.invoiceNumber}</span></div>
              <div className="space-y-3 mb-6">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-body-md"><span className="text-on-surface-variant">{it.quantity} × {it.productName}</span><span>{inr(it.lineSubtotal)}</span></div>
                ))}
              </div>
              <div className="pt-6 border-t border-outline-variant space-y-3 mb-6">
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Subtotal</span><span>{inr(order.subtotal)}</span></div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Shipping</span>
                  {order.deliveryCharge > 0 ? <span>{inr(order.deliveryCharge)}</span> : <span className="text-green-600 font-bold uppercase text-xs">FREE</span>}
                </div>
                <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">GST (18%)</span><span>{inr(order.gstAmount)}</span></div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-body-lg">Total Paid</span>
                <span className="text-headline-md font-headline-md text-primary">{inr(order.totalAmount)}</span>
              </div>
              <div className="bg-surface-container rounded-lg p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" style={fill1} aria-hidden="true">account_balance_wallet</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">PAID VIA PRINTX WALLET</span>
              </div>
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
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70 mt-1">Full wallet refund if cancelled now</span>
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

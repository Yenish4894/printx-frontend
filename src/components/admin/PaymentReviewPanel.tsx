"use client";

import { useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import Button from "@/components/ui/Button";
import { paymentStage, PAYMENT_STAGE } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";
import { REJECT_REASON_MAX, REJECT_REASON_MIN } from "@/lib/paymentRules";

export interface AdminPayment {
  method: string;
  status: string;
  amount: number;
  proofUrl: string | null;
  proofName: string | null;
  proofUploadedAt: string | null;
  reference: string | null;
  rejectReason: string | null;
  reviewedAt: string | null;
  /** Other orders whose proof quotes the same UTR. */
  referenceUsedOn?: string[];
}

const isImage = (name: string | null) => !!name && /\.(png|jpe?g|webp)$/i.test(name);

/**
 * Verify a customer's bank transfer. Approving moves the order to PLACED (and
 * issues the invoice); rejecting keeps it PAYMENT_PENDING and tells the
 * customer why, so they can upload again.
 */
export default function PaymentReviewPanel({
  orderId,
  orderNumber,
  orderTotal,
  payment,
  onReviewed,
}: {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  payment: AdminPayment | null;
  onReviewed: () => Promise<void> | void;
}) {
  const confirm = useConfirm();
  const toast = useToast();
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stage = paymentStage(payment);
  const meta = PAYMENT_STAGE[stage];
  const canReview = stage === "in_review";

  async function approve() {
    const ok = await confirm({
      title: `Approve payment for ${orderNumber}?`,
      message: `Only approve once ${inr(orderTotal)} is in the bank account. The order moves to Placed and the invoice is issued.`,
      confirmLabel: "Approve payment",
    });
    if (!ok) return;
    setBusy("APPROVE");
    setError(null);
    try {
      await admin.orders.reviewPayment(orderId, "APPROVE", payment!.proofUrl!);
      toast("Payment approved — order placed", "success");
      await onReviewed();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not approve the payment");
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (reason.trim().length < REJECT_REASON_MIN) {
      setError("Tell the customer what was wrong, so they know what to upload.");
      return;
    }
    setBusy("REJECT");
    setError(null);
    try {
      await admin.orders.reviewPayment(orderId, "REJECT", payment!.proofUrl!, reason.trim());
      toast("Proof rejected — the customer has been asked to re-upload", "success");
      setRejecting(false);
      setReason("");
      await onReviewed();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not reject the payment");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow" aria-labelledby="payment-review-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 id="payment-review-heading" className="font-headline-md text-lg text-primary">Payment verification</h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <dt className="text-on-surface-variant">Amount due</dt>
          <dd className="font-bold text-on-surface tabular-nums text-base">{inr(orderTotal)}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">UTR / reference</dt>
          <dd className="font-bold text-on-surface break-all">{payment?.reference || "Not provided"}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Proof uploaded</dt>
          <dd className="font-bold text-on-surface">
            {payment?.proofUploadedAt ? formatDateTime(payment.proofUploadedAt) : "Not yet"}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Payment remark to look for</dt>
          <dd className="font-bold text-on-surface">{orderNumber}</dd>
        </div>
      </dl>

      {!!payment?.referenceUsedOn?.length && (
        <p role="note" className="mb-6 flex items-start gap-2 rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] mt-0.5">warning</span>
          <span>
            This UTR is also quoted on {payment.referenceUsedOn.join(", ")}. Check the bank statement shows a separate
            transfer for this order before approving.
          </span>
        </p>
      )}

      {stage === "awaiting_proof" && (
        <p className="mb-6 rounded-lg bg-surface-container px-4 py-3 text-body-md text-on-surface-variant">
          The customer hasn&apos;t uploaded a payment screenshot yet. There&apos;s nothing to verify until they do.
        </p>
      )}

      {stage === "rejected" && (
        <p className="mb-6 rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container">
          Last proof rejected{payment?.reviewedAt ? ` on ${formatDateTime(payment.reviewedAt)}` : ""}:{" "}
          <span className="font-bold">{payment?.rejectReason}</span>. Waiting for the customer to upload a new one.
        </p>
      )}

      {payment?.proofUrl && (
        <div className="mb-6">
          {isImage(payment.proofName) ? (
            <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.proofUrl}
                alt={`Payment screenshot for ${orderNumber}`}
                className="max-h-96 w-auto rounded-lg border border-outline-variant object-contain bg-surface-container-low"
              />
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-secondary group-hover:underline">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">open_in_new</span>
                Open full size
              </span>
            </a>
          ) : (
            <a
              href={payment.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-3 font-bold text-secondary hover:bg-surface-container-low"
            >
              <span aria-hidden="true" className="material-symbols-outlined">description</span>
              {payment.proofName ?? "Open payment proof"}
            </a>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 text-sm font-bold text-error">
          {error}
        </p>
      )}

      {canReview && !rejecting && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={approve} loading={busy === "APPROVE"} disabled={busy !== null} icon="check_circle">
            Approve payment
          </Button>
          <Button variant="secondary" onClick={() => { setRejecting(true); setError(null); }} disabled={busy !== null} icon="block">
            Reject proof
          </Button>
        </div>
      )}

      {canReview && rejecting && (
        <div className="space-y-3">
          <label htmlFor="payment-reject-reason" className="block text-sm font-bold text-on-surface">
            Reason — the customer will see this
          </label>
          <textarea
            id="payment-reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={REJECT_REASON_MAX}
            rows={3}
            autoFocus
            placeholder="e.g. Amount in the screenshot is ₹1,100 but the order total is ₹1,298."
            className="w-full rounded-lg border border-outline-variant bg-surface p-3 text-body-md focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" onClick={reject} loading={busy === "REJECT"} disabled={busy !== null}>
              Reject and ask to re-upload
            </Button>
            <Button variant="ghost" onClick={() => { setRejecting(false); setReason(""); setError(null); }} disabled={busy !== null}>
              Back
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

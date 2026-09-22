"use client";

import { useRef, useState } from "react";
import { orders as ordersApi, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useToast } from "@/components/ui/UIProvider";
import Button from "@/components/ui/Button";
import { paymentStage, PAYMENT_STAGE } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";
import { proofFileProblem, PROOF_MAX_BYTES, PROOF_REFERENCE_MAX, PROOF_TYPES, type BankDetails } from "@/lib/paymentRules";

export type { BankDetails };

export interface PaymentInfo {
  status: string;
  amount: number;
  proofUrl: string | null;
  proofName: string | null;
  proofUploadedAt: string | null;
  reference: string | null;
  rejectReason: string | null;
  reviewedAt: string | null;
}

const ACCEPT = [...PROOF_TYPES].join(",");
const MAX_MB = PROOF_MAX_BYTES / (1024 * 1024);

/**
 * Bank-transfer payment for one order: where to send the money, then the proof.
 *
 * The same component sits on the post-checkout page and the order page, so the
 * customer sees one consistent set of instructions wherever they land.
 */
export default function PaymentPanel({
  orderId,
  orderNumber,
  amount,
  payment,
  bank,
  onUpdated,
}: {
  orderId: string;
  orderNumber: string;
  amount: number;
  payment: PaymentInfo | null;
  bank: BankDetails | null;
  /** Receives the refreshed order after a successful upload. */
  onUpdated: (order: unknown) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState(payment?.reference ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stage = paymentStage(payment);
  const meta = PAYMENT_STAGE[stage];

  if (stage === "verified") {
    return (
      <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6 flex items-start gap-4">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-success shrink-0">
          <span aria-hidden="true" className="material-symbols-outlined">verified</span>
        </span>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Payment verified</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            We received {inr(payment?.amount ?? amount)}
            {payment?.reviewedAt ? ` on ${formatDateTime(payment.reviewedAt)}` : ""}. Your order is in production.
          </p>
        </div>
      </section>
    );
  }

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied`, "success");
    } catch {
      toast("Couldn't copy — select it and copy manually", "error");
    }
  }

  async function submit() {
    if (!file) {
      setError("Choose the screenshot of your payment first.");
      return;
    }
    // Same rules the server applies, checked before a 10 MB upload is spent on them.
    const problem = proofFileProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { order } = await ordersApi.uploadPaymentProof(orderId, file, reference.trim() || undefined);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      toast("Payment proof uploaded. We'll verify it shortly.", "success");
      onUpdated(order);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const rows: [string, string | null][] = bank
    ? [
        ["Account holder", bank.accountName],
        ["Account number", bank.accountNumber],
        ["IFSC", bank.ifsc],
        ["Bank", bank.bankName],
      ]
    : [];

  return (
    <section className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden" aria-labelledby="payment-heading">
      <header className="px-6 py-5 border-b border-outline-variant/40 flex flex-wrap items-center justify-between gap-3">
        <h2 id="payment-heading" className="font-headline-md text-headline-md text-on-surface">
          Complete your payment
        </h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </header>

      {stage === "rejected" && payment?.rejectReason && (
        <div role="alert" className="mx-6 mt-5 flex items-start gap-3 rounded-lg bg-error-container px-4 py-3 text-on-error-container">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] mt-0.5">error</span>
          <div>
            <p className="font-bold">We couldn&apos;t verify your last screenshot</p>
            <p className="text-body-md mt-0.5">{payment.rejectReason}</p>
            <p className="text-body-md mt-1">Please upload a new one below.</p>
          </div>
        </div>
      )}

      {stage === "in_review" && (
        <div role="status" className="mx-6 mt-5 flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3 text-blue-900">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] mt-0.5">hourglass_top</span>
          <div>
            <p className="font-bold">We&apos;re checking your payment</p>
            <p className="text-body-md mt-0.5">
              Uploaded {payment?.proofUploadedAt ? formatDateTime(payment.proofUploadedAt) : ""}.
              Your order is confirmed as soon as we match it to our bank statement.
              {payment?.proofUrl && (
                <>
                  {" "}
                  <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">
                    View your screenshot
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* Step 1: where to send it */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Step 1 · Transfer</p>
          <div className="mt-3 flex items-end justify-between gap-3 rounded-lg bg-surface-container-low px-4 py-3">
            <div>
              <p className="text-body-md text-on-surface-variant">Amount to pay</p>
              <p className="font-headline-md text-headline-md text-on-surface tabular-nums">{inr(amount)}</p>
            </div>
            <button
              type="button"
              onClick={() => copy("Amount", amount.toFixed(2))}
              aria-label="Copy amount"
              className="inline-flex items-center gap-1 min-h-11 px-3 rounded-lg text-sm font-bold text-secondary hover:bg-secondary/10"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">content_copy</span>
              Copy
            </button>
          </div>

          {bank ? (
            <dl className="mt-3 divide-y divide-outline-variant/40 rounded-lg border border-outline-variant/40">
              {rows
                .filter(([, v]) => !!v)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <dt className="text-xs text-on-surface-variant">{label}</dt>
                      <dd className="font-bold text-on-surface break-all tabular-nums">{value}</dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(label, value!)}
                      aria-label={`Copy ${label}`}
                      className="shrink-0 flex items-center justify-center w-11 h-11 -my-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                ))}
            </dl>
          ) : (
            <p className="mt-3 rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container">
              Our bank details aren&apos;t available right now. Please contact us before paying.
            </p>
          )}

          <p className="mt-3 text-body-md text-on-surface-variant">
            Add <span className="font-bold text-on-surface">{orderNumber}</span> as the payment remark so we can match
            it quickly.
          </p>
        </div>

        {/* Step 2: prove it */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Step 2 · {stage === "awaiting_proof" ? "Upload proof" : "Upload a new proof"}
          </p>

          <label
            htmlFor={`proof-${orderId}`}
            className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30 ${
              file ? "border-secondary bg-secondary/5" : "border-outline-variant hover:border-secondary hover:bg-surface-container-low"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[32px] text-secondary">
              {file ? "task" : "upload_file"}
            </span>
            <span className="font-bold text-on-surface break-all">
              {file ? file.name : "Choose payment screenshot"}
            </span>
            <span className="text-xs text-on-surface-variant">PNG, JPG, WebP or PDF · up to {MAX_MB} MB</span>
            <input
              ref={fileRef}
              id={`proof-${orderId}`}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              aria-invalid={!!error}
              aria-describedby={error ? `proof-error-${orderId}` : undefined}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
            />
          </label>

          <label htmlFor={`ref-${orderId}`} className="mt-4 block text-sm font-bold text-on-surface">
            Transaction reference / UTR <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <input
            id={`ref-${orderId}`}
            type="text"
            inputMode="text"
            maxLength={PROOF_REFERENCE_MAX}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. 412345678901"
            className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />

          {error && (
            <p id={`proof-error-${orderId}`} role="alert" className="mt-3 text-sm font-bold text-error">
              {error}
            </p>
          )}

          <Button className="mt-4" fullWidth loading={uploading} onClick={submit} icon="send" disabled={!bank}>
            {uploading ? "Uploading…" : stage === "awaiting_proof" ? "Submit payment proof" : "Submit new proof"}
          </Button>
        </div>
      </div>
    </section>
  );
}

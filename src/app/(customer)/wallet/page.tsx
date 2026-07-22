"use client";

import { useEffect, useState } from "react";
import { wallet as walletApi, ApiError } from "@/lib/api";
import { useSession, inr } from "@/components/SessionProvider";
import { useToast } from "@/components/ui/UIProvider";
import { formatDateTime } from "@/lib/format";
import { isRazorpayEnabled, openRazorpayCheckout } from "@/lib/razorpayCheckout";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const presetAmounts = [500, 1000, 2000, 5000, 10000, 25000];

const MIN_TOPUP = 100;
const MAX_TOPUP = 100000;

interface Txn {
  id: string;
  type: "CREDIT" | "DEBIT" | "REFUND";
  amount: number;
  balanceAfter: number;
  reference: string | null;
  description: string | null;
  relatedOrderId?: string | null;
  createdAt: string;
}

const txnStyle = {
  CREDIT: { icon: "add_circle", iconBg: "bg-emerald-100 text-emerald-600", typeBg: "bg-emerald-100 text-emerald-700", label: "Credit", sign: "+", amountColor: "text-emerald-600" },
  DEBIT: { icon: "shopping_cart", iconBg: "bg-red-100 text-red-600", typeBg: "bg-red-100 text-red-700", label: "Debit", sign: "-", amountColor: "text-red-600" },
  REFUND: { icon: "replay", iconBg: "bg-blue-100 text-blue-600", typeBg: "bg-blue-100 text-blue-700", label: "Refund", sign: "+", amountColor: "text-blue-600" },
} as const;

type Filter = "All" | "Credits" | "Debits" | "Refunds";

export default function WalletManagement() {
  const { user, refresh } = useSession();
  const toast = useToast();

  const [txns, setTxns] = useState<Txn[] | null>(null);
  const [txnLoading, setTxnLoading] = useState(true);
  const [txnError, setTxnError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number | "">(2000);
  const [submitting, setSubmitting] = useState(false);

  const [filter, setFilter] = useState<Filter>("All");

  const balance = user?.walletBalance ?? 0;

  async function loadTransactions() {
    setTxnLoading(true);
    setTxnError(null);
    try {
      const res = await walletApi.transactions();
      const list = Array.isArray(res) ? res : (res.transactions ?? []);
      setTxns(list as Txn[]);
    } catch (err) {
      setTxnError(err instanceof ApiError ? err.message : "Failed to load transactions.");
    } finally {
      setTxnLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const numericAmount = typeof amount === "number" ? amount : 0;
  const validAmount = numericAmount >= MIN_TOPUP && numericAmount <= MAX_TOPUP;
  const rangeHint =
    amount === "" || validAmount
      ? null
      : numericAmount < MIN_TOPUP
        ? "Enter an amount of at least ₹100."
        : "Maximum top-up is ₹1,00,000.";
  const previewBalance = balance + numericAmount;

  async function handleTopUp() {
    if (!validAmount) return;
    setSubmitting(true);
    try {
      if (isRazorpayEnabled()) {
        // Online payment via Razorpay: create order → checkout → verify.
        const order = await walletApi.createTopUpOrder(numericAmount);
        const result = await openRazorpayCheckout({
          keyId: order.keyId,
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "Bhagini Graphics",
          description: "Wallet top-up",
          prefill: { name: user?.ownerName, email: user?.email, contact: user?.mobile },
        });
        const res = await walletApi.verifyTopUp({
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        });
        await refresh();
        await loadTransactions();
        toast(`${inr(res.wallet.credited)} added. New balance ${inr(res.wallet.balance)}.`, "success");
      } else {
        // Dev fallback (no gateway keys): credit directly.
        const res = await walletApi.topUp(numericAmount);
        await refresh();
        await loadTransactions();
        toast(`${inr(res.wallet.credited)} added. New balance ${inr(res.wallet.balance)}.`, "success");
      }
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Top-up failed. Please try again.";
      if (msg !== "Payment cancelled") toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Derived stats from the ledger.
  const totalAdded = (txns ?? [])
    .filter((t) => t.type === "CREDIT" || t.type === "REFUND")
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = (txns ?? [])
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + t.amount, 0);

  const filtered = (txns ?? []).filter((t) => {
    if (filter === "All") return true;
    if (filter === "Credits") return t.type === "CREDIT";
    if (filter === "Debits") return t.type === "DEBIT";
    return t.type === "REFUND";
  });

  return (
    <main className="p-gutter md:p-margin-desktop max-w-container-max mx-auto">
      {/* Wallet header */}
      <div className="header-deep-gradient rounded-xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-headline-lg font-headline-lg">My Bhagini Wallet</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-3 py-1 rounded-lg"><p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">Recent Credits</p><p className="text-body-md font-bold">{inr(totalAdded)}</p></div>
            <div className="bg-white/10 px-3 py-1 rounded-lg"><p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">Recent Debits</p><p className="text-body-md font-bold">{inr(totalSpent)}</p></div>
            <div className="bg-white/10 px-3 py-1 rounded-lg border border-secondary/40"><p className="text-[10px] text-secondary-container uppercase font-bold tracking-tighter">Current Balance</p><p className="text-body-md font-extrabold text-secondary-container">{inr(balance)}</p></div>
          </div>
        </div>
        <div className="flex flex-col items-end z-10">
          <span className="text-white/40 text-label-caps mb-1">Available for orders</span>
          <span className="text-display-lg font-display-lg leading-none">{inr(balance)}</span>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
              <p className="text-on-surface-variant text-label-caps uppercase mb-1">Recent Credits</p><p className="text-headline-md text-primary font-bold">{inr(totalAdded)}</p><p className="text-[10px] text-on-surface-variant">Credits + refunds in this list</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
              <p className="text-on-surface-variant text-label-caps uppercase mb-1">Recent Debits</p><p className="text-headline-md text-primary font-bold">{inr(totalSpent)}</p><p className="text-[10px] text-on-surface-variant">On orders in this list</p>
            </div>
          </div>

          {/* Add money */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined" style={fill1} aria-hidden="true">account_balance_wallet</span></div>
              <div><h2 className="text-headline-md text-primary">Add Money to Wallet</h2><p className="text-on-surface-variant text-body-md opacity-70">Top up your balance for instant one-click checkouts.</p></div>
            </div>
            <div className="mb-8">
              <p className="block text-label-caps text-on-surface-variant mb-4 uppercase">Select Amount</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(a)}
                    className={a === amount ? "py-3 px-2 border-2 border-secondary bg-secondary/5 rounded-lg font-bold text-secondary transition-all" : "py-3 px-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:border-secondary hover:text-secondary transition-all"}
                  >
                    {inr(a).replace(".00", "")}
                  </button>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2">
                  <label htmlFor="topup-amount" className="sr-only">Custom top-up amount in rupees</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold" aria-hidden="true">₹</span>
                    <input
                      id="topup-amount"
                      className="w-full pl-8 pr-4 py-4 rounded-xl border border-outline-variant focus:border-secondary focus:ring-0 text-headline-md font-bold transition-all"
                      placeholder="Enter custom amount"
                      type="number"
                      inputMode="numeric"
                      step={1}
                      min={MIN_TOPUP}
                      max={MAX_TOPUP}
                      aria-describedby="topup-hint"
                      aria-invalid={rangeHint ? true : undefined}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === "" ? "" : Math.floor(Number(e.target.value)))}
                    />
                  </div>
                  <p
                    id="topup-hint"
                    role={rangeHint ? "alert" : undefined}
                    className={`text-[10px] mt-2 uppercase font-bold ${rangeHint ? "text-error" : "text-on-surface-variant"}`}
                  >
                    {rangeHint ?? "min ₹100 / max ₹1,00,000"}
                  </p>
                </div>
                {validAmount && (
                  <div className="w-full md:w-1/2 bg-surface-container p-4 rounded-xl border border-dashed border-outline-variant">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-2">After Top-Up Preview</p>
                    <div className="flex justify-between items-center"><span className="text-body-md text-on-surface-variant">New Balance</span><span className="text-headline-md font-bold text-emerald-600">{inr(previewBalance)}</span></div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTopUp}
              disabled={submitting || !validAmount}
              className="w-full py-5 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined${submitting ? " animate-spin" : ""}`} aria-hidden="true">{submitting ? "progress_activity" : "add_circle"}</span>
              {submitting ? "Processing…" : `Add ${validAmount ? inr(numericAmount).replace(".00", "") : "money"} to Wallet`}
            </button>
          </section>

          {/* Transaction history */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-headline-md text-primary">Transaction History</h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface-container p-1 rounded-lg">
                  {(["All", "Credits", "Debits", "Refunds"] as Filter[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilter(t)}
                      className={t === filter ? "px-4 py-1.5 bg-white text-secondary rounded-md text-label-caps font-bold shadow-sm" : "px-4 py-1.5 text-on-surface-variant hover:text-on-surface rounded-md text-label-caps font-bold transition-all"}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {txnLoading ? (
                <div className="p-10 text-center text-sm text-on-surface-variant">Loading transactions…</div>
              ) : txnError ? (
                <div className="p-6 text-center">
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold inline-flex flex-col items-center gap-3">
                    <span>{txnError}</span>
                    <button
                      type="button"
                      onClick={loadTransactions}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-xs tracking-wide"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40" aria-hidden="true">receipt_long</span>
                  <p className="text-sm font-bold text-on-surface">No transactions yet</p>
                  <p className="text-xs text-on-surface-variant">Top up your wallet to get started.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th scope="col" className="px-8 py-4 text-left text-label-caps text-on-surface-variant font-bold uppercase">Transaction Details</th>
                      <th scope="col" className="px-8 py-4 text-center text-label-caps text-on-surface-variant font-bold uppercase">Type</th>
                      <th scope="col" className="px-8 py-4 text-right text-label-caps text-on-surface-variant font-bold uppercase">Amount</th>
                      <th scope="col" className="px-8 py-4 text-right text-label-caps text-on-surface-variant font-bold uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filtered.map((t) => {
                      const s = txnStyle[t.type];
                      return (
                        <tr key={t.id} className="hover:bg-surface-container/30 transition-all">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.iconBg}`}><span className="material-symbols-outlined" aria-hidden="true">{s.icon}</span></div>
                              <div>
                                <p className="font-bold text-on-surface">{t.description ?? s.label}</p>
                                <p className="text-[10px] text-on-surface-variant">
                                  {t.reference ? `${t.reference} • ` : ""}{formatDateTime(t.createdAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.typeBg}`}>{s.label}</span></td>
                          <td className={`px-8 py-5 text-right font-bold ${s.amountColor}`}>{s.sign}{inr(t.amount)}</td>
                          <td className="px-8 py-5 text-right font-mono text-on-surface-variant">{inr(t.balanceAfter)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Account details */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <h3 className="text-headline-md text-primary mb-6">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Business</span>
                <span className="text-body-md font-bold">{user?.businessName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Account Holder</span>
                <span className="text-body-md font-bold">{user?.ownerName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Mobile</span>
                <span className="text-body-md font-bold">{user?.mobile ?? "—"}</span>
              </div>
              {user?.gstNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-on-surface-variant">GST</span>
                  <span className="text-body-md font-bold font-mono">{user.gstNumber}</span>
                </div>
              )}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Current Balance</span>
                <span className="text-headline-md font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-lg" style={fill1} aria-hidden="true">check_circle</span>
                  {inr(balance)}
                </span>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="bg-primary-container p-6 rounded-2xl shadow-sm text-white">
            <h3 className="text-headline-md mb-4">Wallet Payments</h3>
            <p className="text-body-md text-white/80">
              Your Bhagini Wallet is used to pay for print orders instantly at checkout. Top up any time — the balance never expires.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

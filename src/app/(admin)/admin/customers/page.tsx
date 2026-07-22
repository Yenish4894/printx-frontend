"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";
import { statusLabel, statusBadge } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

type Customer = {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string | null;
  walletBalance: number;
  isActive: boolean;
  orderCount: number;
  joinedAt: string;
};

type CustomerDetail = {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string | null;
  walletBalance: number;
  isActive: boolean;
  joinedAt: string;
  totalSpent: number;
  addresses: {
    id: string; label: string | null; name: string; line1: string; line2: string | null;
    city: string; state: string; pincode: string; phone: string | null; isDefault: boolean;
  }[];
  orders: { id: string; orderNumber: string; status: string; totalAmount: number; placedAt: string }[];
  walletTransactions: {
    id: string; type: string; amount: number; balanceAfter: number; description: string | null; createdAt: string;
  }[];
};

export default function AdminCustomers() {
  const confirm = useConfirm();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // wallet adjust form
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState<"credit" | "debit">("credit");
  const [adjNote, setAdjNote] = useState("");
  const [adjBusy, setAdjBusy] = useState(false);
  const [adjError, setAdjError] = useState<string | null>(null);

  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const { customers } = await admin.customers.list();
      setCustomers(customers as Customer[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load customers");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchDetail = async (id: string, opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);
    }
    try {
      const { customer } = await admin.customers.get(id);
      setDetail(customer as CustomerDetail);
    } catch (e) {
      if (!opts?.silent) setDetailError(e instanceof ApiError ? e.message : "Failed to load customer");
    } finally {
      if (!opts?.silent) setDetailLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    setAdjAmount("");
    setAdjNote("");
    setAdjType("credit");
    setAdjError(null);
    setDrawerError(null);
    await fetchDetail(id);
  };

  const closeDrawer = () => {
    if (adjBusy || toggleBusyId) return; // don't dismiss mid-save
    setDetail(null);
    setDetailError(null);
    setDrawerError(null);
  };

  const toggleActive = async (id: string, isActive: boolean, fromDrawer = false) => {
    const next = !isActive;
    if (!next) {
      const ok = await confirm({
        title: "Deactivate this customer?",
        message: "They will be signed out and blocked from ordering.",
        confirmLabel: "Deactivate",
        danger: true,
      });
      if (!ok) return;
    }
    setToggleBusyId(id);
    if (fromDrawer) setDrawerError(null);
    else setError(null);
    try {
      await admin.customers.setActive(id, next);
      setCustomers((prev) => prev.map((x) => (x.id === id ? { ...x, isActive: next } : x)));
      setDetail((d) => (d && d.id === id ? { ...d, isActive: next } : d));
      toast(next ? "Customer activated" : "Customer deactivated", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to update status";
      if (fromDrawer) setDrawerError(msg);
      else setError(msg);
      toast(msg, "error");
    } finally {
      setToggleBusyId(null);
    }
  };

  const adjNum = Number(adjAmount);
  const adjValid = Number.isFinite(adjNum) && adjNum > 0;
  const resultingBalance = detail
    ? detail.walletBalance + (adjType === "credit" ? (adjValid ? adjNum : 0) : -(adjValid ? adjNum : 0))
    : 0;

  const applyAdjustment = async () => {
    if (!detail) return;
    if (!adjValid) {
      setAdjError("Enter a positive amount");
      return;
    }
    if (adjType === "debit" && adjNum > detail.walletBalance) {
      setAdjError(`Debit exceeds the wallet balance of ${inr(detail.walletBalance)}.`);
      return;
    }
    if (adjType === "debit") {
      const ok = await confirm({
        title: "Remove money from wallet?",
        message: `${inr(adjNum)} will be debited. Resulting balance: ${inr(resultingBalance)}.`,
        confirmLabel: "Debit wallet",
        danger: true,
      });
      if (!ok) return;
    }
    const signed = adjType === "credit" ? adjNum : -adjNum;
    setAdjBusy(true);
    setAdjError(null);
    try {
      await admin.customers.adjustWallet(detail.id, signed, adjNote || undefined);
      setAdjAmount("");
      setAdjNote("");
      await fetchDetail(detail.id, { silent: true });
      await load({ silent: true });
      toast(adjType === "credit" ? "Wallet credited" : "Wallet debited", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Adjustment failed";
      setAdjError(msg);
      toast(msg, "error");
    } finally {
      setAdjBusy(false);
    }
  };

  const drawerOpen = detailLoading || !!detail || !!detailError;
  useEffect(() => {
    if (!drawerOpen) return;
    drawerCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, adjBusy, toggleBusyId]);

  const visible = customers.filter((c) =>
    statusFilter === "All" ? true : statusFilter === "Active" ? c.isActive : !c.isActive,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Customers</h1>
          <p className="font-body-md text-on-surface-variant">{customers.length} registered customers</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-on-surface-variant">Status</label>
            <div className="flex bg-surface-container p-1 rounded-lg">
              {(["All", "Active", "Inactive"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStatusFilter(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold ${statusFilter === t ? "bg-white shadow-sm text-secondary" : "text-on-surface-variant hover:bg-white/50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => load()} aria-label="Refresh customers" className="p-2.5 bg-surface-container rounded-lg hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined" aria-hidden="true">refresh</span></button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error/10 text-error text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => load()} className="underline font-bold">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                {["Customer", "Contact Details", "Wallet Balance", "Orders", "GST", "Status", ""].map((h, i) => (
                  <th key={i} scope="col" className={`px-6 py-4 font-label-caps text-on-surface-variant ${h === "Status" ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">Loading customers…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">No customers found.</td></tr>
              ) : (
                visible.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-on-surface">{c.businessName}</p>
                        <p className="text-xs text-on-surface-variant">{c.ownerName} · Joined {formatDateTime(c.joinedAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="text-sm"><p className="text-on-surface">{c.email}</p><p className="text-on-surface-variant">{c.mobile}</p></div></td>
                    <td className="px-6 py-4 font-bold text-on-surface">{inr(c.walletBalance)}</td>
                    <td className="px-6 py-4 text-on-surface">{c.orderCount}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{c.gstNumber ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Switch
                          checked={c.isActive}
                          onChange={() => toggleActive(c.id, c.isActive)}
                          disabled={toggleBusyId === c.id}
                          label={c.isActive ? `Deactivate ${c.businessName}` : `Activate ${c.businessName}`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><button onClick={() => openDetail(c.id)} className="text-secondary font-bold text-sm hover:underline">View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-between">
          <p className="text-sm text-on-surface-variant font-label-caps">Showing {visible.length} of {customers.length} customers</p>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[90]" onClick={closeDrawer}></div>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Customer profile"
            className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.1)] z-[100] flex flex-col"
          >
            <div className="p-6 header-deep-gradient text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button ref={drawerCloseRef} aria-label="Close customer profile" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={closeDrawer}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
                <h3 className="font-headline-md">Customer Profile</h3>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant">Loading…</div>
            ) : detailError ? (
              <div className="flex-1 flex items-center justify-center text-error text-sm px-6 text-center">{detailError}</div>
            ) : detail ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {drawerError && (
                  <div className="m-4 p-3 rounded-lg bg-error/10 text-error text-sm font-medium flex items-center justify-between" role="alert">
                    <span>{drawerError}</span>
                    <button onClick={() => setDrawerError(null)} aria-label="Dismiss error" className="ml-3"><span className="material-symbols-outlined text-sm" aria-hidden="true">close</span></button>
                  </div>
                )}
                <div className="p-6 border-b border-surface-container bg-background">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-headline-md text-on-surface">{detail.businessName}</h4>
                      <p className="text-sm text-on-surface-variant">{detail.ownerName}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{detail.mobile} · {detail.email}</p>
                      {detail.gstNumber && <p className="text-xs text-on-surface-variant mt-1">GST: {detail.gstNumber}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${detail.isActive ? "bg-green-500" : "bg-outline-variant"}`}></span>
                        <span className={`text-xs font-bold ${detail.isActive ? "text-green-600" : "text-on-surface-variant"}`}>{detail.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-label-caps text-on-surface-variant">Active</span>
                      <Switch
                        checked={detail.isActive}
                        onChange={() => toggleActive(detail.id, detail.isActive, true)}
                        disabled={toggleBusyId === detail.id}
                        label={detail.isActive ? "Deactivate customer" : "Activate customer"}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-label-caps text-on-surface-variant">Total Spent</p>
                      <p className="font-bold text-on-surface">{inr(detail.totalSpent)}</p>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-label-caps text-on-surface-variant">Orders</p>
                      <p className="font-bold text-on-surface">{detail.orders.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-surface-container">
                  <div className="header-deep-gradient p-5 rounded-xl text-white shadow-xl mb-6 flex justify-between items-center">
                    <div><p className="text-xs font-label-caps opacity-70">Current Wallet Balance</p><p className="text-display-lg font-price-lg mt-1">{inr(detail.walletBalance)}</p></div>
                    <span className="material-symbols-outlined text-4xl opacity-20" style={fill1} aria-hidden="true">account_balance_wallet</span>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                    <h5 className="font-label-caps text-on-surface-variant mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm" aria-hidden="true">edit_note</span> Manual Adjustment</h5>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="adj-amount" className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Amount (₹)</label>
                        <input id="adj-amount" className="border border-surface-container bg-white rounded-lg p-2 focus:ring-secondary/20" type="number" min="0" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} placeholder="0.00" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Type</span>
                        <div className="flex p-1 bg-white border border-surface-container rounded-lg h-full" role="group" aria-label="Adjustment type">
                          <button type="button" aria-pressed={adjType === "credit"} onClick={() => setAdjType("credit")} className={`flex-1 text-[10px] font-bold uppercase rounded py-1 ${adjType === "credit" ? "bg-secondary text-white" : "text-on-surface-variant"}`}>Credit</button>
                          <button type="button" aria-pressed={adjType === "debit"} onClick={() => setAdjType("debit")} className={`flex-1 text-[10px] font-bold uppercase rounded py-1 ${adjType === "debit" ? "bg-secondary text-white" : "text-on-surface-variant"}`}>Debit</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                      <label htmlFor="adj-note" className="text-[10px] font-bold uppercase text-on-surface-variant ml-1">Reason / Note</label>
                      <input id="adj-note" className="border border-surface-container bg-white rounded-lg p-2 text-sm" type="text" value={adjNote} onChange={(e) => setAdjNote(e.target.value)} placeholder="Manual adjustment by admin" />
                    </div>
                    {adjValid && (
                      <p className="text-xs mb-3 text-on-surface-variant">
                        Resulting balance:{" "}
                        <span className={`font-bold ${resultingBalance < 0 ? "text-error" : "text-on-surface"}`}>{inr(resultingBalance)}</span>
                      </p>
                    )}
                    {adjError && <p className="text-error text-xs mb-3" role="alert">{adjError}</p>}
                    <button onClick={applyAdjustment} disabled={adjBusy || !adjValid} className="w-full primary-accent-gradient text-white py-2 rounded-lg font-button text-sm shadow-md disabled:opacity-50">{adjBusy ? "Applying…" : "Apply Adjustment"}</button>
                  </div>
                </div>

                <div className="p-6 border-b border-surface-container">
                  <h5 className="font-label-caps text-on-surface-variant mb-4">Recent Orders</h5>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.orders.slice(0, 8).map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                          <span className="font-bold text-sm text-secondary">{o.orderNumber}</span>
                          <span className="text-sm">{inr(o.totalAmount)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${statusBadge(o.status)}`}>{statusLabel(o.status)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 border-b border-surface-container">
                  <h5 className="font-label-caps text-on-surface-variant mb-4">Wallet Transactions</h5>
                  {detail.walletTransactions.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No transactions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.walletTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">{t.type}</span>
                            <p className="text-xs text-on-surface-variant">{t.description ?? ""}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${t.type === "DEBIT" ? "text-error" : "text-green-600"}`}>{t.type === "DEBIT" ? "-" : "+"}{inr(t.amount)}</span>
                            <p className="text-[10px] text-on-surface-variant">Bal {inr(t.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h5 className="font-label-caps text-on-surface-variant mb-4">Addresses</h5>
                  {detail.addresses.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No saved addresses.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.addresses.map((a) => (
                        <div key={a.id} className="p-3 bg-surface-container-low rounded-lg text-sm">
                          <p className="font-bold text-on-surface">{a.name} {a.label ? `(${a.label})` : ""} {a.isDefault && <span className="text-[10px] text-secondary font-bold uppercase ml-1">Default</span>}</p>
                          <p className="text-on-surface-variant">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</p>
                          {a.phone && <p className="text-on-surface-variant text-xs">{a.phone}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

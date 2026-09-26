"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { admin, ApiError } from "@/lib/api";
import { inr } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";
import { statusLabel, statusBadge } from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/format";
import Pager from "@/components/ui/Pager";
import { EmptyState, LoadingState, TableState } from "@/components/ui/States";
import Button from "@/components/ui/Button";
import { APPROVAL_STATUS, APPROVAL_REASON_MAX, APPROVAL_REASON_MIN, type ApprovalStatus } from "@/lib/approval";

// Each tab is a filter the server applies. "Active" means approved AND switched
// on: a pending applicant is technically isActive but can't sign in, so it must
// not show up as an active customer.
const FILTERS = ["All", "Pending", "Active", "Inactive", "Rejected"] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_QUERY: Record<Filter, { active?: string; approval?: string }> = {
  All: {},
  Pending: { approval: "PENDING" },
  Active: { active: "true", approval: "APPROVED" },
  Inactive: { active: "false" },
  Rejected: { approval: "REJECTED" },
};


type Customer = {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
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
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  approvalRejectReason: string | null;
  approvalReviewedAt: string | null;
  joinedAt: string;
  totalSpent: number;
  orderCount: number;
  addresses: {
    id: string; label: string | null; name: string; line1: string; line2: string | null;
    city: string; state: string; pincode: string; phone: string | null; isDefault: boolean;
  }[];
  orders: { id: string; orderNumber: string; status: string; totalAmount: number; placedAt: string }[];
};

// useSearchParams needs a Suspense boundary; the dashboard's "signups to approve"
// tile links here with ?filter=pending so it lands on the right tab.
export default function AdminCustomers() {
  return (
    <Suspense fallback={<LoadingState label="Loading customers" />}>
      <CustomersScreen />
    </Suspense>
  );
}

function CustomersScreen() {
  const confirm = useConfirm();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Filter>(searchParams.get("filter") === "pending" ? "Pending" : "All");
  const [pendingCount, setPendingCount] = useState(0);
  // Approving / rejecting a signup from the drawer.
  const [reviewBusy, setReviewBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pageSize: 50, hasMore: false });

  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);


  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const res = await admin.customers.list({ page, ...FILTER_QUERY[statusFilter] });
      setCustomers(res.customers as Customer[]);
      setPendingCount(res.pendingApproval);
      setMeta({ total: res.total, pageSize: res.pageSize, hasMore: res.hasMore });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load customers");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [page, statusFilter]);

  // Started from a timer callback, not synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
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
    setDrawerError(null);
    setRejecting(false);
    setRejectReason("");
    await fetchDetail(id);
  };

  const closeDrawer = () => {
    if (toggleBusyId || reviewBusy) return; // don't dismiss mid-save
    setDetail(null);
    setDetailError(null);
    setDrawerError(null);
    setRejecting(false);
    setRejectReason("");
  };

  const reviewSignup = async (action: "APPROVE" | "REJECT") => {
    if (!detail) return;
    if (action === "APPROVE") {
      const ok = await confirm({
        title: `Approve ${detail.businessName}?`,
        message: "They will be able to sign in and place orders straight away.",
        confirmLabel: "Approve",
      });
      if (!ok) return;
    } else if (rejectReason.trim().length < APPROVAL_REASON_MIN) {
      setDrawerError("Tell the applicant why, so they know what to fix or who to call.");
      return;
    }
    setReviewBusy(true);
    setDrawerError(null);
    try {
      const { result } = await admin.customers.review(detail.id, action, action === "REJECT" ? rejectReason.trim() : undefined);
      toast(
        action === "REJECT"
          ? "Application rejected."
          : result.isActive
            ? "Approved. They can sign in now."
            : "Approved, but this account is switched off, so they still can't sign in. Switch it on to let them in.",
        "success",
      );
      setRejecting(false);
      setRejectReason("");
      await Promise.all([fetchDetail(detail.id, { silent: true }), load({ silent: true })]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not update this application";
      setDrawerError(msg);
      toast(msg, "error");
    } finally {
      setReviewBusy(false);
    }
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
  }, [drawerOpen, toggleBusyId]);

  // Filtering happens in the DB now, so the page shows exactly what came back.
  const visible = customers;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Customers</h1>
          <p className="font-body-md text-on-surface-variant">
            {statusFilter === "Pending"
              ? `${meta.total} ${meta.total === 1 ? "application" : "applications"} waiting for approval`
              : statusFilter === "Rejected"
                ? `${meta.total} rejected ${meta.total === 1 ? "application" : "applications"}`
                : `${meta.total} ${statusFilter === "All" ? "registered" : statusFilter.toLowerCase()} ${meta.total === 1 ? "customer" : "customers"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-on-surface-variant">Status</label>
            <div className="flex bg-surface-container p-1 rounded-lg">
              {FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setStatusFilter(t); setPage(1); }}
                  aria-pressed={statusFilter === t}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 ${statusFilter === t ? "bg-white shadow-sm text-secondary" : "text-on-surface-variant hover:bg-white/50"}`}
                >
                  {t}
                  {t === "Pending" && pendingCount > 0 && (
                    <span aria-label={`${pendingCount} waiting`} className="min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[11px] flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
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
                {["Customer", "Contact Details", "Orders", "GST", "Status", ""].map((h, i) => (
                  <th key={i} scope="col" className={`px-6 py-4 font-label-caps text-on-surface-variant ${h === "Status" ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <TableState colSpan={6}><LoadingState label="Loading customers" compact /></TableState>
              ) : visible.length === 0 ? (
                <TableState colSpan={6}>
                  <EmptyState
                    compact
                    icon="group"
                    title={statusFilter === "All" ? "No customers yet" : statusFilter === "Pending" ? "No applications waiting" : `No ${statusFilter.toLowerCase()} customers`}
                    description={statusFilter === "All" ? "Businesses that register will appear here." : statusFilter === "Pending" ? "New signups will show up here for you to approve." : "Try another filter."}
                  />
                </TableState>
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
                    <td className="px-6 py-4 text-on-surface">{c.orderCount}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{c.gstNumber ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {c.approvalStatus === "APPROVED" ? (
                          <Switch
                            checked={c.isActive}
                            onChange={() => toggleActive(c.id, c.isActive)}
                            disabled={toggleBusyId === c.id}
                            label={c.isActive ? `Deactivate ${c.businessName}` : `Activate ${c.businessName}`}
                          />
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${APPROVAL_STATUS[c.approvalStatus].badge}`}>
                            {APPROVAL_STATUS[c.approvalStatus].label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><button onClick={() => openDetail(c.id)} className="text-secondary font-bold text-sm hover:underline">View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-container bg-surface-container-low">
          {meta.total > meta.pageSize ? (
            <Pager
              page={page}
              pageSize={meta.pageSize}
              total={meta.total}
              hasMore={meta.hasMore}
              onPage={setPage}
              busy={loading}
              label="customers"
            />
          ) : (
            <p className="text-sm text-on-surface-variant font-label-caps">
              Showing {visible.length} of {meta.total} customers
            </p>
          )}
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
                      {detail.approvalStatus === "APPROVED" && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${detail.isActive ? "bg-green-500" : "bg-outline-variant"}`}></span>
                          <span className={`text-xs font-bold ${detail.isActive ? "text-success" : "text-on-surface-variant"}`}>{detail.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      )}
                    </div>
                    {detail.approvalStatus === "APPROVED" && (
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-label-caps text-on-surface-variant">Active</span>
                        <Switch
                          checked={detail.isActive}
                          onChange={() => toggleActive(detail.id, detail.isActive, true)}
                          disabled={toggleBusyId === detail.id}
                          label={detail.isActive ? "Deactivate customer" : "Activate customer"}
                        />
                      </div>
                    )}
                  </div>
                  {detail.approvalStatus !== "APPROVED" && (
                    <div className="mt-4 rounded-lg border border-outline-variant bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${APPROVAL_STATUS[detail.approvalStatus].badge}`}>
                          {APPROVAL_STATUS[detail.approvalStatus].label}
                        </span>
                        <span className="text-xs text-on-surface-variant">Can&apos;t sign in until approved</span>
                      </div>
                      {detail.approvalStatus === "REJECTED" && detail.approvalRejectReason && (
                        <p className="mt-3 text-sm text-on-surface-variant">
                          Rejected{detail.approvalReviewedAt ? ` on ${formatDateTime(detail.approvalReviewedAt)}` : ""}:{" "}
                          <span className="font-bold text-on-surface">{detail.approvalRejectReason}</span>
                        </p>
                      )}
                      {detail.approvalStatus === "PENDING" && (
                        <p className="mt-3 text-sm text-on-surface-variant">
                          Check the business details above (GST number, phone) before approving.
                        </p>
                      )}
                      {rejecting ? (
                        <div className="mt-3 space-y-3">
                          <label htmlFor="signup-reject-reason" className="block text-sm font-bold text-on-surface">
                            Reason. The applicant will see this when they try to sign in.
                          </label>
                          <textarea
                            id="signup-reject-reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            maxLength={APPROVAL_REASON_MAX}
                            rows={3}
                            autoFocus
                            placeholder="e.g. We couldn't match the GST number to a registered business."
                            className="w-full rounded-lg border border-outline-variant bg-surface p-3 text-body-md focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          />
                          <div className="flex flex-wrap gap-3">
                            <Button variant="danger" onClick={() => reviewSignup("REJECT")} loading={reviewBusy} disabled={reviewBusy}>
                              Reject application
                            </Button>
                            <Button variant="ghost" onClick={() => { setRejecting(false); setRejectReason(""); setDrawerError(null); }} disabled={reviewBusy}>
                              Back
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button onClick={() => reviewSignup("APPROVE")} loading={reviewBusy} disabled={reviewBusy} icon="check_circle">
                            {detail.approvalStatus === "REJECTED" ? "Approve after all" : "Approve"}
                          </Button>
                          {detail.approvalStatus === "PENDING" && (
                            <Button variant="secondary" onClick={() => { setRejecting(true); setDrawerError(null); }} disabled={reviewBusy} icon="block">
                              Reject
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-label-caps text-on-surface-variant">Total Spent</p>
                      <p className="font-bold text-on-surface">{inr(detail.totalSpent)}</p>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-label-caps text-on-surface-variant">Orders</p>
                      <p className="font-bold text-on-surface">{detail.orderCount}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-surface-container">
                  <h5 className="font-label-caps text-on-surface-variant mb-4">
                    Recent Orders{detail.orderCount > 20 ? ` (latest 20 of ${detail.orderCount})` : ""}
                  </h5>
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

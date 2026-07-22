"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { admin, ApiError } from "@/lib/api";
import { useSession } from "@/components/SessionProvider";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";
import { formatDateTime } from "@/lib/format";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

interface Staff {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
interface Stats {
  total: number;
  superAdmins: number;
  active: number;
}

const roleClass: Record<string, string> = {
  SUPER_ADMIN: "bg-secondary/10 text-secondary border border-secondary/20",
  ADMIN: "bg-tertiary-container text-tertiary-fixed-dim border border-on-tertiary-container/30",
};
const roleLabel: Record<string, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Admin" };

const emptyForm = { ownerName: "", email: "", mobile: "", password: "", role: "ADMIN" as "ADMIN" | "SUPER_ADMIN" };

export default function AdminUsers() {
  const { user } = useSession();
  const isSuper = user?.role === "SUPER_ADMIN";
  const confirm = useConfirm();
  const toast = useToast();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const r = await admin.staff.list();
      setStaff(r.staff as Staff[]);
      setStats(r.stats as Stats);
    } catch (e) {
      if (!opts?.silent) setError(e instanceof ApiError ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mobileValid = /^[6-9][0-9]{9}$/.test(form.mobile);
  const passwordValid = form.password.length >= 8;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const nameValid = form.ownerName.trim().length > 0;
  const formValid = mobileValid && passwordValid && emailValid && nameValid;

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setForm(emptyForm);
    setModalError(null);
    setShowPassword(false);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) {
      setModalError("Please fix the highlighted fields before continuing.");
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      await admin.staff.create(form);
      setModalOpen(false);
      setForm(emptyForm);
      setShowPassword(false);
      await load({ silent: true });
      toast("Admin invited", "success");
    } catch (e) {
      setModalError(e instanceof ApiError ? e.message : "Could not create admin");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(a: Staff) {
    if (a.isActive) {
      const ok = await confirm({
        title: `Deactivate ${a.name}?`,
        message: "They will lose access to the admin console until reactivated.",
        confirmLabel: "Deactivate",
        danger: true,
      });
      if (!ok) return;
    }
    setBusyId(a.id);
    setError(null);
    try {
      await admin.staff.update(a.id, { isActive: !a.isActive });
      await load({ silent: true });
      toast(a.isActive ? "Admin deactivated" : "Admin activated", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not update admin";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }
  async function changeRole(a: Staff, role: string) {
    if (role === a.role) return;
    const toSuper = role === "SUPER_ADMIN";
    const ok = await confirm({
      title: toSuper ? `Promote ${a.name} to Super Admin?` : `Change ${a.name} to Admin?`,
      message: toSuper
        ? "Super Admins can invite admins, change roles, and revoke access."
        : "They will lose Super Admin privileges.",
      confirmLabel: "Change role",
      danger: toSuper,
    });
    if (!ok) return;
    setBusyId(a.id);
    setError(null);
    try {
      await admin.staff.update(a.id, { role });
      await load({ silent: true });
      toast("Role updated", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not update role";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }
  async function remove(a: Staff) {
    const ok = await confirm({
      title: `Remove admin ${a.name}?`,
      message: "This permanently revokes their admin account.",
      confirmLabel: "Remove admin",
      danger: true,
    });
    if (!ok) return;
    setBusyId(a.id);
    setError(null);
    try {
      await admin.staff.remove(a.id);
      await load({ silent: true });
      toast("Admin removed", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not remove admin";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  const fmtLogin = (d: string | null) => (d ? formatDateTime(d) : "Never");

  const filtered = staff.filter(
    (a) => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()) || roleLabel[a.role].toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => {
    if (!modalOpen) return;
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, saving]);

  const statCards: [string, number, string, string][] = stats
    ? [
        ["Total Admins", stats.total, "All admin accounts", "group"],
        ["Super Admins", stats.superAdmins, "Elevated privileges", "verified_user"],
        ["Active", stats.active, "Currently enabled", "check_circle"],
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Super Admin banner */}
      <div className="bg-primary-container rounded-xl p-4 flex items-center gap-4">
        <div className="bg-secondary/10 p-2 rounded-full"><span className="material-symbols-outlined text-secondary" style={fill1}>security</span></div>
        <div className="flex-1">
          <h3 className="font-label-caps text-label-caps text-secondary uppercase">{isSuper ? "Super Admin Console" : "Admin View (read-only)"}</h3>
          <p className="font-body-md text-on-primary-container text-sm">{isSuper ? "You can invite admins, change roles, and revoke access." : "Only super-admins can invite or modify admin accounts."}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Users &amp; Roles</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage administrative access and audit account activity.</p>
        </div>
        {isSuper && (
          <button onClick={() => setModalOpen(true)} className="coral-gradient text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-xl transition-all active:scale-95"><span className="material-symbols-outlined">person_add</span><span className="font-button text-button">Add New Admin</span></button>
        )}
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-error-container/60 text-on-error-container" role="alert">{error}</div>}

      {/* Filter */}
      <div className="bg-surface-container-lowest p-4 rounded-xl premium-shadow flex flex-wrap items-center gap-4 border border-outline-variant/30">
        <div className="w-full sm:flex-1 sm:min-w-[240px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent border border-outline-variant rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-md text-body-md" placeholder="Filter by name, email or role..." type="text" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">{["Name", "Contact", "Role", "Last Login", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className={`px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant ${h === "Status" ? "text-center" : h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filtered.map((a) => (
                <tr key={a.id} className={`hover:bg-surface-container-low transition-colors group ${!a.isActive ? "opacity-70" : ""}`}>
                  <td className="px-gutter py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">{a.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                      <div><p className="font-body-md text-on-surface font-semibold">{a.name}{a.id === user?.id && <span className="ml-2 text-[10px] text-secondary font-bold">(you)</span>}</p><p className="text-[12px] text-on-surface-variant">{a.businessName}</p></div>
                    </div>
                  </td>
                  <td className="px-gutter py-4 font-body-md text-on-surface-variant"><p>{a.email}</p><p className="text-xs">{a.mobile}</p></td>
                  <td className="px-gutter py-4">
                    {isSuper && a.id !== user?.id ? (
                      <select aria-label={`Role for ${a.name}`} value={a.role} disabled={busyId === a.id} onChange={(e) => changeRole(a, e.target.value)} className={`px-2 py-1 rounded-full font-label-caps text-[10px] uppercase font-bold disabled:opacity-50 ${roleClass[a.role]}`}>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-bold ${roleClass[a.role]}`}>{roleLabel[a.role]}</span>
                    )}
                  </td>
                  <td className="px-gutter py-4 font-body-md text-on-surface-variant text-sm">{fmtLogin(a.lastLoginAt)}</td>
                  <td className="px-gutter py-4">
                    <div className="flex justify-center">
                      <Switch
                        checked={a.isActive}
                        onChange={() => toggle(a)}
                        disabled={!isSuper || a.id === user?.id || busyId === a.id}
                        label={a.isActive ? `Deactivate ${a.name}` : `Activate ${a.name}`}
                      />
                    </div>
                  </td>
                  <td className="px-gutter py-4 text-right">
                    {isSuper && a.id !== user?.id && (
                      <button onClick={() => remove(a)} disabled={busyId === a.id} aria-label={`Remove admin ${a.name}`} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50" title="Remove admin"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">person_remove</span></button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-gutter py-16 text-center text-on-surface-variant">No admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(([label, value, sub, icon]) => (
          <div key={label} className="bg-primary-container p-6 rounded-xl border border-secondary/20 shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <p className="font-label-caps text-label-caps text-on-primary-container uppercase mb-2">{label}</p>
              <p className="font-price-lg text-[42px] text-white">{value}</p>
              <p className="mt-4 text-on-primary-container text-sm font-medium">{sub}</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/5 group-hover:scale-110 transition-transform duration-500">{icon}</span>
          </div>
        ))}
      </div>

      {/* Add-admin modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm" onClick={closeModal}>
          <form role="dialog" aria-modal="true" aria-labelledby="add-admin-title" className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} onSubmit={invite}>
            <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 id="add-admin-title" className="font-headline-md text-headline-md text-primary">Add New Admin</h3>
              <button type="button" aria-label="Close" className="p-2 hover:bg-surface-container rounded-full disabled:opacity-50" disabled={saving} onClick={closeModal}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
            </div>
            <div className="p-8 space-y-5">
              {modalError && (
                <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm font-medium" role="alert">{modalError}</div>
              )}
              <div>
                <label htmlFor="admin-name" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Full Name</label>
                <input id="admin-name" ref={firstFieldRef} required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="e.g. Priya Mehta" type="text" />
              </div>
              <div>
                <label htmlFor="admin-mobile" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Mobile Number</label>
                <input id="admin-mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} maxLength={10} pattern="[6-9][0-9]{9}" inputMode="numeric" className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="9876543210" type="tel" />
                {form.mobile && !mobileValid && <p className="text-error text-[11px] mt-1">Enter a valid 10-digit Indian mobile (starts 6-9).</p>}
              </div>
              <div>
                <label htmlFor="admin-email" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email Address</label>
                <input id="admin-email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="name@bhaginigraphics.co.in" type="email" />
                {form.email && !emailValid && <p className="text-error text-[11px] mt-1">Enter a valid email address.</p>}
              </div>
              <div>
                <label htmlFor="admin-password" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Temporary Password</label>
                <div className="relative">
                  <input id="admin-password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="At least 8 characters" type={showPassword ? "text" : "password"} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface rounded-full">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {form.password && !passwordValid && <p className="text-error text-[11px] mt-1">Password must be at least 8 characters.</p>}
              </div>
              <div>
                <label htmlFor="admin-role" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Role</label>
                <select id="admin-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "SUPER_ADMIN" })} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50"><option value="ADMIN">Admin</option><option value="SUPER_ADMIN">Super Admin</option></select>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button type="button" onClick={closeModal} disabled={saving} className="px-6 py-3 rounded-xl border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-60">Cancel</button>
              <button type="submit" disabled={saving || !formValid} className="px-6 py-3 rounded-xl coral-gradient text-white font-button shadow-lg disabled:opacity-60">{saving ? "Creating…" : "Create Admin"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

type Admin = {
  name: string; id: string; email: string; role: string; roleClass: string;
  lastLogin: string; active: boolean; img?: string; initials?: string; dim?: boolean;
};

const admins: Admin[] = [
  { name: "Julian Sterling", id: "AD-9902", email: "j.sterling@printx.com", role: "Super Admin", roleClass: "bg-secondary/10 text-secondary border border-secondary/20", lastLogin: "2 mins ago", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHtSjkrDYaqXl9BZXPRwxn0xIa9AQ4wj-jKspkEJi0zpkOZZUluqeola9lwlSk-HcP0EMotW8XbcZSngpJJiRAUWSzJpJDDSeJoM7d58k376kJtwwWosLoUd7oQJCVTCy7oTUpUrZm7FDsudaVDVJA__OEO8rNZfyCnV4oMDu50dUUGh1jeLx4XkoFYqXSbHQrWjD0UfMDC_VG-uSZng-B1oS-O2z3T4iVlMwVEuZ52pUxmxlStQ-5BEGVssAECFN6EtZSYnc0_Ak" },
  { name: "Elena Vance", id: "AD-1104", email: "e.vance@printx.com", role: "Admin", roleClass: "bg-tertiary-container text-tertiary-fixed-dim border border-on-tertiary-container/30", lastLogin: "Oct 24, 09:45 AM", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZvYJTjV5cnlRfinuiuaZ7bJzsKj_H2kHwnfUaQ3UlKmhtNpdVskbMxF3_KR8jqD7eBfw87s2tEN4ybnruRbaaOV6aU3U30AZcWNdh9O60YOfSIRejSs3TFnLww7v5XALMtZsCOo6ZKQS2GmP735ckB0E-I5TEAEEtzAWK26REUDYkMSuRKoIkU6gB2h9n6DLJoLSPMUyUBURf4CmQk65SkVIuciDl4kv4Qr47ktw9YGOed6nkXkrPOMY7AMVwG6ol9GwLzmu0XSc" },
  { name: "Tariq Moore", id: "AD-0842", email: "t.moore@printx.com", role: "Admin", roleClass: "bg-tertiary-container text-tertiary-fixed-dim border border-on-tertiary-container/30", lastLogin: "Oct 21, 04:12 PM", active: false, initials: "TM", dim: true },
];

const stats: [string, string, string, string][] = [
  ["Total Admins", "12", "+2 this month", "group"],
  ["Security Events", "0", "Last 24 hours", "verified_user"],
  ["Pending Invites", "4", "Expires in 48h", "mail"],
];

export default function AdminUsers() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Super Admin banner */}
      <div className="bg-primary-container rounded-xl p-4 flex items-center gap-4">
        <div className="bg-secondary/10 p-2 rounded-full"><span className="material-symbols-outlined text-secondary" style={fill1}>security</span></div>
        <div className="flex-1">
          <h3 className="font-label-caps text-label-caps text-secondary uppercase">Super Admin Only</h3>
          <p className="font-body-md text-on-primary-container text-sm">You are accessing the elevated privilege management console. All administrative actions are recorded in the immutable system audit log.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Users &amp; Roles</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage administrative access, define permissions, and audit account activity.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="coral-gradient text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-xl transition-all active:scale-95"><span className="material-symbols-outlined">person_add</span><span className="font-button text-button">Invite New Admin</span></button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl premium-shadow flex flex-wrap items-center gap-4 border border-outline-variant/30">
        <div className="flex-1 min-w-[280px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full bg-transparent border border-outline-variant rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-md text-body-md" placeholder="Filter by name, email or role..." type="text" />
          </div>
        </div>
        <div className="flex gap-2">
          <select className="bg-transparent border border-outline-variant rounded-lg font-label-caps text-label-caps py-2 px-3 focus:ring-secondary/20"><option>All Roles</option><option>Super Admin</option><option>Admin</option></select>
          <select className="bg-transparent border border-outline-variant rounded-lg font-label-caps text-label-caps py-2 px-3 focus:ring-secondary/20"><option>All Status</option><option>Active</option><option>Inactive</option></select>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[18px]">filter_list</span> Advanced</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">{["Name", "Email", "Role Badge", "Last Login", "Status", "Actions"].map((h) => (
                <th key={h} className={`px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant ${h === "Status" ? "text-center" : h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {admins.map((a) => (
                <tr key={a.id} className={`hover:bg-surface-container-low transition-colors group ${a.dim ? "opacity-70" : ""}`}>
                  <td className="px-gutter py-4">
                    <div className="flex items-center gap-3">
                      {a.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="w-10 h-10 rounded-full object-cover shadow-sm" alt={a.name} src={a.img} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">{a.initials}</div>
                      )}
                      <div><p className="font-body-md text-on-surface font-semibold">{a.name}</p><p className="text-[12px] text-on-surface-variant">ID: {a.id}</p></div>
                    </div>
                  </td>
                  <td className="px-gutter py-4 font-body-md text-on-surface-variant">{a.email}</td>
                  <td className="px-gutter py-4"><span className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-bold ${a.roleClass}`}>{a.role}</span></td>
                  <td className="px-gutter py-4 font-body-md text-on-surface-variant text-sm">{a.lastLogin}</td>
                  <td className="px-gutter py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked={a.active} className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </td>
                  <td className="px-gutter py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-on-tertiary-fixed-variant hover:bg-surface-container rounded-lg transition-colors" title="Edit Profile"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button className="p-2 text-on-tertiary-fixed-variant hover:bg-surface-container rounded-lg transition-colors" title="Reset Password"><span className="material-symbols-outlined text-[20px]">lock_reset</span></button>
                      <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Revoke Access"><span className="material-symbols-outlined text-[20px]">person_remove</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-gutter py-4 bg-surface-container-low/30 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="font-label-caps text-label-caps text-on-surface-variant">Showing 3 of 12 Administrators</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(([label, value, sub, icon]) => (
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

      {/* Invite modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-primary">Invite New Admin</h3>
              <button className="p-2 hover:bg-surface-container rounded-full" onClick={() => setModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-8 space-y-5">
              <div><label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Full Name</label><input className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="e.g. Priya Mehta" type="text" /></div>
              <div><label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email Address</label><input className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50" placeholder="name@printx.in" type="email" /></div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Role</label>
                <select className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50"><option>Admin</option><option>Super Admin</option></select>
              </div>
              <p className="text-xs text-on-surface-variant">An invite link will be emailed; it expires in 48 hours.</p>
            </div>
            <div className="px-8 py-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl coral-gradient text-white font-button shadow-lg">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

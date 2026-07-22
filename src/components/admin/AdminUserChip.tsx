"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionProvider";

export default function AdminUserChip() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const roleLabel = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
  const initials = (user?.ownerName ?? "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="text-right hidden sm:block">
          <p className="font-button text-on-surface leading-none">{user?.ownerName ?? "Admin"}</p>
          <p className="text-[11px] text-on-surface-variant/70 uppercase font-black tracking-wider">{roleLabel}</p>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-secondary-container bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
          {initials || "A"}
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-xl z-50 py-2">
            <div className="px-4 py-2 border-b border-outline-variant">
              <p className="font-button text-on-surface text-sm truncate">{user?.businessName}</p>
              <p className="text-xs text-on-surface-variant truncate">{user?.mobile}</p>
            </div>
            <button
              role="menuitem"
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

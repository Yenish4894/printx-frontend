"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import BrandLogo from "@/components/BrandLogo";

const groups: { label: string; items: { icon: string; label: string; href: string }[] }[] = [
  { label: "Overview", items: [{ icon: "dashboard", label: "Dashboard", href: "/admin" }] },
  {
    label: "Catalog",
    items: [
      { icon: "inventory_2", label: "Products", href: "/admin/products" },
      { icon: "category", label: "Categories", href: "/admin/categories" },
      { icon: "tune", label: "Spec Configuration", href: "/admin/spec-config" },
    ],
  },
  {
    label: "Sales",
    items: [
      { icon: "receipt_long", label: "Orders", href: "/admin/orders" },
      { icon: "group", label: "Customers", href: "/admin/customers" },
      { icon: "currency_exchange", label: "Refunds", href: "/admin/refunds" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { icon: "campaign", label: "Coupons & Promos", href: "/admin/coupons" },
      { icon: "reviews", label: "Reviews", href: "/admin/reviews" },
    ],
  },
  { label: "Finance", items: [{ icon: "account_balance", label: "Wallet & Transactions", href: "/admin/transactions" }] },
  {
    label: "System",
    items: [
      { icon: "settings", label: "Settings", href: "/admin/settings" },
      { icon: "admin_panel_settings", label: "Admin Users", href: "/admin/users" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile hamburger trigger — fixed top-left, only visible < md */}
      <button
        className="md:hidden fixed top-4 left-4 z-60 p-2 rounded-lg bg-primary-container shadow-lg text-on-primary-container"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Backdrop — mobile only */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-55" onClick={close} />
      )}

      {/* Sidebar — always visible on md+, slide-in on mobile */}
      <aside
        className={[
          "fixed left-0 top-0 h-full w-64 bg-primary-container shadow-sm flex flex-col py-8 z-56 overflow-y-auto custom-scrollbar transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <div>
            <BrandLogo textClass="text-headline-md font-extrabold" iconSize={26} />
            <p className="text-on-primary-container text-xs opacity-60 tracking-widest uppercase mt-1">Admin Console</p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden p-1 rounded text-on-primary-container/70 hover:text-on-primary-container"
            onClick={close}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-5 px-0 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="px-6 text-[10px] font-black text-on-primary-container/40 tracking-[0.2em] mb-2 uppercase">{g.label}</p>
              {g.items.map((it) => {
                const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={close}
                    className={
                      active
                        ? "flex items-center gap-3 py-3 px-6 bg-secondary-container/10 text-secondary-container border-l-4 border-secondary-container font-bold"
                        : "flex items-center gap-3 py-3 px-6 text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/50 transition-colors duration-200 border-l-4 border-transparent"
                    }
                  >
                    <span className="material-symbols-outlined">{it.icon}</span>
                    <span className="font-body-md text-body-md">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-6 mt-auto pt-8 border-t border-on-primary-container/10">
          <Link href="/admin/orders" onClick={close} className="block w-full py-3 px-4 bg-secondary-container text-on-secondary rounded-lg font-button text-button text-center shadow-lg shadow-secondary-container/20 hover:scale-[1.02] active:scale-95 transition-all">
            New Print Order
          </Link>
          <div className="mt-6 space-y-1">
            <a className="flex items-center gap-3 py-2 text-on-primary-container/50 hover:text-on-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">help</span>
              <span className="text-sm">Support</span>
            </a>
            <Link className="flex items-center gap-3 py-2 text-error hover:text-red-400 transition-colors" href="/admin-login">
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="text-sm">Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

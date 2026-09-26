"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import BrandLogo from "@/components/BrandLogo";
import { useSession } from "@/components/SessionProvider";
import NotificationBell from "@/components/NotificationBell";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "My Orders" },
];

export default function CustomerNav() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const initials = (user?.ownerName ?? "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const shortName = user?.ownerName?.split(" ")[0] ?? "Account";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="bg-primary-container sticky top-0 border-b border-outline-variant/20 shadow-lg z-50">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-container-max mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 lg:gap-8 min-w-0">
          {/* A signed-in customer clicking the logo wants their dashboard, not
              the public marketing site they're no longer really a visitor of. */}
          <Link className="flex items-center shrink-0" href="/dashboard" aria-label="Bhagini Graphics — dashboard">
            <BrandLogo textClass="text-lg sm:text-headline-md font-black" iconSize={28} />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden lg:flex gap-5">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "text-secondary-fixed font-bold border-b-2 border-secondary-fixed pb-1 font-body-md"
                      : "text-white/75 hover:text-white transition-colors font-body-md"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NotificationBell tone="dark" />
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="relative hover:bg-primary/10 transition-all duration-200 p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-on-primary-container" aria-hidden="true">logout</span>
          </button>
          <Link href="/account" aria-label="My account and password" title="My account" className="hidden sm:flex items-center gap-3 pl-2 border-l border-outline-variant/30 rounded-lg hover:opacity-90">
            <div className="text-right hidden xl:block">
              <p className="text-on-primary font-bold text-sm leading-tight">{shortName}</p>
              <p className="text-white/70 text-xs">{user?.businessName ?? "Customer"}</p>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-secondary-container bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
              {initials || "?"}
            </div>
          </Link>
          {/* Hamburger — mobile/tablet only */}
          <button
            className="lg:hidden p-2 rounded-lg text-on-primary-container hover:bg-primary/20 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop anchored to the header's bottom edge (top-full) so it never
              relies on a hardcoded header height. */}
          <div className="absolute top-full left-0 right-0 h-screen bg-black/40 z-40 lg:hidden" onClick={close} />
          <nav className="lg:hidden absolute top-full left-0 right-0 bg-primary-container border-t border-outline-variant/20 z-50 shadow-xl">
            <div className="px-gutter py-4 space-y-1">
              {links.map((l) => {
                const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-container/15 text-secondary-fixed font-bold"
                        : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-primary-container/80 hover:bg-primary/30 transition-colors"
                    }
                  >
                    {l.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center gap-3 px-4 py-2">
                <div className="w-9 h-9 rounded-full border-2 border-secondary-container bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                  {initials || "?"}
                </div>
                <Link href="/account" onClick={close} className="flex-1" aria-label="My account and password">
                  <p className="text-on-primary font-bold text-sm">{shortName}</p>
                  <p className="text-white/70 text-xs">{user?.businessName ?? "Customer"}</p>
                </Link>
                <button onClick={() => { close(); logout(); }} aria-label="Sign out" className="text-on-primary-container/80 p-2 rounded-lg hover:bg-primary/30">
                  <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

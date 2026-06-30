"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import BrandLogo from "@/components/BrandLogo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "My Orders" },
  { href: "/wallet", label: "Wallet" },
];

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCh8ow5mOgY3sMeUzUjGeY98gTVMzQvoCv3eYNzS2Eg9Ciu0DjFGgCC-H6jJEqpW2QzgeLv8JHuvVBQwM55rp-3yxGchbHPdmSo50f-Ntks_TMQt0qLyOCrmS0-Hx7jQot4KeArjFlTOppq4rkw420Y-asglFjtSB1H4l-1uhjhnzb-A6xDp6fU5AlDmfTOWIsjm8Y9umLhE8BQmf7FM6K-koeuUu3DIRX4NMsCj6FU-SkhNDp30q635oKEx1diSm56GxQ8-eqSQbw";

export default function CustomerNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="bg-primary-container sticky top-0 border-b border-outline-variant/20 shadow-lg z-50">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-container-max mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link className="flex items-center" href="/dashboard">
            <BrandLogo textClass="text-headline-md font-black" iconSize={30} />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "text-secondary-fixed font-bold border-b-2 border-secondary-fixed pb-1 font-body-md"
                      : "text-on-primary-container/70 hover:text-on-primary-container transition-colors font-body-md"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/wallet" className="bg-secondary-container text-on-secondary-container font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-90 transition-transform text-sm">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <span className="font-price-lg hidden sm:inline">₹2,450.00</span>
          </Link>
          <button className="relative hover:bg-primary/10 transition-all duration-200 p-2 rounded-full">
            <span className="material-symbols-outlined text-on-primary-container">notifications</span>
            <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-primary-container">3</span>
          </button>
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-outline-variant/30">
            <div className="text-right hidden md:block">
              <p className="text-on-primary font-bold text-sm leading-tight">Priya M.</p>
              <p className="text-on-primary-container/60 text-xs">Customer</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-9 h-9 rounded-full border-2 border-secondary-container object-cover" alt="Priya Mehta" src={AVATAR} />
          </div>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-on-primary-container hover:bg-primary/20 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 top-16.25 bg-black/40 z-40 md:hidden" onClick={close} />
          <nav className="md:hidden absolute top-full left-0 right-0 bg-primary-container border-t border-outline-variant/20 z-50 shadow-xl">
            <div className="px-gutter py-4 space-y-1">
              {links.map((l) => {
                const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={close}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-9 h-9 rounded-full border-2 border-secondary-container object-cover" alt="Priya Mehta" src={AVATAR} />
                <div>
                  <p className="text-on-primary font-bold text-sm">Priya M.</p>
                  <p className="text-on-primary-container/60 text-xs">Customer</p>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

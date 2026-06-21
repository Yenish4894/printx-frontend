"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  return (
    <header className="bg-primary-container sticky top-0 border-b border-outline-variant/20 shadow-lg z-50">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-10">
          <Link className="font-display-lg text-headline-md font-black tracking-tight" href="/dashboard">
            <span className="text-white">Print</span>
            <span className="text-secondary-container">X</span>
          </Link>
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
        <div className="flex items-center gap-4">
          <Link href="/wallet" className="bg-secondary-container text-on-secondary-container font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <span className="font-price-lg text-sm">₹2,450.00</span>
          </Link>
          <button className="relative hover:bg-primary/10 transition-all duration-200 p-2 rounded-full">
            <span className="material-symbols-outlined text-on-primary-container">notifications</span>
            <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-primary-container">3</span>
          </button>
          <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
            <div className="text-right hidden sm:block">
              <p className="text-on-primary font-bold text-sm leading-tight">Priya M.</p>
              <p className="text-on-primary-container/60 text-xs">Customer</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-10 h-10 rounded-full border-2 border-secondary-container object-cover" alt="Priya Mehta" src={AVATAR} />
          </div>
        </div>
      </div>
    </header>
  );
}

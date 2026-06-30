"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="bg-primary-container text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-container-max mx-auto px-gutter py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#home" onClick={close} className="flex items-center gap-3">
          <BrandLogo textClass="text-headline-md" iconSize={30} />
          <span className="hidden lg:block h-6 w-px bg-white/20"></span>
          <span className="hidden lg:block font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest mt-1">
            Online Printing
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 font-button text-button">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={i === 0 ? "text-secondary-container border-b-2 border-secondary-container" : "hover:text-secondary-container transition-colors"}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link className="hidden sm:inline font-button text-button hover:text-secondary-container transition-colors" href="/login">
            Sign In
          </Link>
          <Link
            href="/login"
            className="primary-gradient text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-button text-button shadow-lg shadow-secondary-container/20 active:scale-95 transition-transform"
          >
            Register
          </Link>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 -mr-1 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-primary-container shadow-xl">
          <div className="px-gutter py-2 flex flex-col">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="py-3 font-button text-button text-on-primary-container/90 hover:text-secondary-container border-b border-white/5 last:border-0 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link href="/login" onClick={close} className="py-3 font-button text-button text-secondary-container">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

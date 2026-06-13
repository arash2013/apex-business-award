"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand } from "@/config/brand";

const NAV_LINKS = [
  { href: "/winners", label: "Winners" },
  { href: "/about", label: "Our Process" },
];

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="#C9A84C" strokeWidth="1.5" />
      <polygon
        points="14,5 16.2,11.2 22.8,11.2 17.6,15.1 19.8,21.3 14,17.4 8.2,21.3 10.4,15.1 5.2,11.2 11.8,11.2"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-navy text-white sticky top-0 z-50">
      {/* Thin gold top accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <LogoMark />
            <div className="leading-none">
              <span className="text-gold font-bold text-sm tracking-wide block">{brand.name}</span>
              <span className="text-white/30 text-[9px] uppercase tracking-ultra block mt-0.5">{brand.city} · {brand.year}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/apply"
              className="ml-3 inline-flex items-center gap-1.5 bg-gold text-navy text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold-400 transition-colors"
            >
              Check Your Business
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/apply"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-gold text-navy text-center mt-2"
          >
            Check Your Business
          </Link>
        </div>
      )}
    </header>
  );
}

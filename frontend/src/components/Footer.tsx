import Link from "next/link";
import { brand } from "@/config/brand";

const LINKS = [
  { href: "/winners", label: "Winners" },
  { href: "/about", label: "Our Process" },
  { href: "/apply", label: "Check Your Business" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      {/* Gold gradient top line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="13" stroke="#C9A84C" strokeWidth="1.5" />
                <polygon
                  points="14,5 16.2,11.2 22.8,11.2 17.6,15.1 19.8,21.3 14,17.4 8.2,21.3 10.4,15.1 5.2,11.2 11.8,11.2"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gold font-bold text-sm tracking-wide">{brand.name}</p>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">{brand.tagline}</p>
            <p className="text-white/20 text-xs mt-3 uppercase tracking-widest">
              {brand.city}, {brand.state} · {brand.year}
            </p>
          </div>

          {/* Nav */}
          <nav>
            <p className="text-white/25 text-[10px] uppercase tracking-ultra mb-4 font-medium">
              Navigation
            </p>
            <ul className="space-y-2.5">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/45 hover:text-gold text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/20">
          <span>&copy; {brand.year} {brand.name}. All rights reserved.</span>
          <span className="font-mono text-white/15">
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"}
            {process.env.NEXT_PUBLIC_GIT_SHA
              ? ` · ${process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7)}`
              : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { brand } from "@/config/brand";

const LINKS = [
  { href: "/winners", label: "Winners" },
  { href: "/about", label: "How We Select" },
  { href: "/apply", label: "Check Your Business" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xs">
            <p className="text-gold font-bold text-lg mb-1 tracking-tight">{brand.name}</p>
            <p className="text-white/50 text-sm leading-relaxed">{brand.tagline}</p>
            <p className="text-white/25 text-xs mt-3">
              {brand.city}, {brand.state} · {brand.year}
            </p>
          </div>
          <nav>
            <p className="text-white/35 text-xs uppercase tracking-widest mb-3 font-medium">
              Navigation
            </p>
            <ul className="space-y-2">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/55 hover:text-gold text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/25">
          <span>&copy; {brand.year} {brand.name}. All rights reserved.</span>
          <span className="font-mono">
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

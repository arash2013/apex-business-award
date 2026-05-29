import Link from "next/link";
import { brand } from "@/config/brand";

export function Nav() {
  return (
    <header className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold font-bold text-lg">{brand.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/winners" className="hover:text-gold transition-colors">
              Winners
            </Link>
            <Link href="/about" className="hover:text-gold transition-colors">
              About
            </Link>
            <Link href="/apply" className="hover:text-gold transition-colors">
              Apply
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

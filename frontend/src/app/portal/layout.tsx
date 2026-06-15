import { CustomerAuthProvider } from "@/lib/customer-auth";
import { brand } from "@/config/brand";
import Link from "next/link";

export const metadata = {
  title: `Customer Portal · ${brand.name}`,
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <header className="bg-navy text-white">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
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
              <span className="text-gold font-bold text-sm tracking-wide">{brand.name}</span>
            </Link>
            <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
              Customer Portal
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
          © {brand.year} {brand.name}. All rights reserved.
        </footer>
      </div>
    </CustomerAuthProvider>
  );
}

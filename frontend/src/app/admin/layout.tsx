import Link from "next/link";
import { brand } from "@/config/brand";

const NAV_ITEMS = [
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/discovery", label: "Discovery" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/outreach", label: "Outreach" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-navy text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <p className="text-gold font-bold text-sm">{brand.name}</p>
          <p className="text-white/50 text-xs mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/30">{brand.year}</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

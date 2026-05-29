import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import { QUALIFIED_BUSINESSES } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: `${brand.year} Winners`,
  description: `Browse ${brand.year} ${brand.name} winners in ${brand.city}, ${brand.state}`,
};

const CATEGORIES = [...new Set(QUALIFIED_BUSINESSES.map((b) => b.category))].sort();
const NEIGHBORHOODS = [...new Set(QUALIFIED_BUSINESSES.map((b) => b.neighborhood))].sort();

export default function WinnersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy mb-2">
          {brand.year} Winners — {brand.city}
        </h1>
        <p className="text-gray-500">
          {QUALIFIED_BUSINESSES.length} businesses recognized for excellence
        </p>
      </div>

      {/* Filter bar (static placeholder — JS filter to be wired up) */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy">
          <option value="">All Neighborhoods</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUALIFIED_BUSINESSES.map((b) => (
          <BusinessCard key={b.slug} {...b} />
        ))}
      </div>
    </div>
  );
}

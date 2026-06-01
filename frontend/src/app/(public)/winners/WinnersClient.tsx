"use client";

import { useState, useMemo } from "react";
import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import type { SeedBusiness } from "@/lib/seed-data";

interface Props {
  businesses: SeedBusiness[];
}

export function WinnersClient({ businesses }: Props) {
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(businesses.map((b) => b.category))].sort(),
    [businesses]
  );
  const neighborhoods = useMemo(
    () => [...new Set(businesses.map((b) => b.neighborhood))].sort(),
    [businesses]
  );

  const filtered = useMemo(
    () =>
      businesses.filter(
        (b) =>
          (!category || b.category === category) &&
          (!neighborhood || b.neighborhood === neighborhood) &&
          (!search || b.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [businesses, category, neighborhood, search]
  );

  const hasFilter = category || neighborhood || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy mb-1">{brand.year} Winners</h1>
        <p className="text-gray-400 text-sm">
          {brand.city}, {brand.state} · {businesses.length} businesses recognized for excellence
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-2">
        <input
          type="search"
          placeholder="Search businesses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white text-navy w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All Neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {hasFilter && (
          <button
            onClick={() => { setCategory(""); setNeighborhood(""); setSearch(""); }}
            className="text-sm text-gray-400 hover:text-navy transition-colors px-2 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-6">
        {filtered.length === businesses.length
          ? `Showing all ${businesses.length} winners`
          : `${filtered.length} of ${businesses.length} winners`}
      </p>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BusinessCard key={b.slug} {...b} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-navy mb-1">No winners match your filters</p>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or clearing the filters.</p>
          <button
            onClick={() => { setCategory(""); setNeighborhood(""); setSearch(""); }}
            className="text-gold hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

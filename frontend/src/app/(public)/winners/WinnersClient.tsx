"use client";

import { useState, useMemo } from "react";
import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import type { Winner } from "./page";

interface Props {
  winners: Winner[];
}

export function WinnersClient({ winners }: Props) {
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(winners.map((w) => w.category_name).filter(Boolean))].sort() as string[],
    [winners]
  );
  const areas = useMemo(
    () => [...new Set(winners.map((w) => w.area_name).filter(Boolean))].sort() as string[],
    [winners]
  );

  const filtered = useMemo(
    () =>
      winners.filter(
        (w) =>
          (!category || w.category_name === category) &&
          (!area || w.area_name === area) &&
          (!search || w.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [winners, category, area, search]
  );

  const hasFilter = category || area || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="section-eyebrow mb-2">{brand.year} Cohort</p>
        <h1 className="heading-display text-4xl font-bold text-navy mb-1">Award Recipients</h1>
        <p className="text-gray-400 text-sm mt-2">
          {winners.length} businesses recognized for excellence
        </p>
      </div>

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
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {hasFilter && (
          <button
            onClick={() => { setCategory(""); setArea(""); setSearch(""); }}
            className="text-sm text-gray-400 hover:text-navy transition-colors px-2 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-6">
        {filtered.length === winners.length
          ? `Showing all ${winners.length} winners`
          : `${filtered.length} of ${winners.length} winners`}
      </p>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <BusinessCard
              key={w.slug}
              slug={w.slug}
              name={w.name}
              category={w.category_name ?? ""}
              neighborhood={w.area_name ?? ""}
              googleRating={w.google_rating ?? 0}
              googleReviewCount={w.google_review_count ?? 0}
              tier={w.tier}
              year={w.year}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-navy mb-1">No winners match your filters</p>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or clearing the filters.</p>
          <button
            onClick={() => { setCategory(""); setArea(""); setSearch(""); }}
            className="text-gold hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import { WinnersFilters } from "./WinnersFilters";
import { QUALIFIED_BUSINESSES } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: `${brand.year} Winners`,
  description: `Browse ${brand.year} ${brand.name} winners in ${brand.city}, ${brand.state}`,
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchAreas() {
  try {
    const res = await fetch(`${API}/api/v1/areas`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/api/v1/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchWinners(searchParams: Record<string, string>) {
  try {
    const params = new URLSearchParams();
    if (searchParams.area_id) params.set("area_id", searchParams.area_id);
    if (searchParams.category_id) params.set("category_id", searchParams.category_id);
    params.set("limit", "50");

    const res = await fetch(`${API}/api/v1/winners?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return null;
  }
}

function apiWinnerToCardProps(w: Record<string, unknown>) {
  return {
    slug: (w.slug as string) ?? "",
    name: w.name as string,
    category: (w.category_name as string) ?? "—",
    neighborhood: (w.area_name as string) ?? "—",
    googleRating: (w.google_rating as number) ?? 0,
    googleReviewCount: (w.google_review_count as number) ?? 0,
    tier: w.tier as "basic" | "pro" | "premium" | undefined,
    year: (w.year as number) ?? brand.year,
  };
}

interface PageProps {
  searchParams: Record<string, string>;
}

export default async function WinnersPage({ searchParams }: PageProps) {
  const [areas, categories, apiWinners] = await Promise.all([
    fetchAreas(),
    fetchCategories(),
    fetchWinners(searchParams),
  ]);

  // fall back to local seed data when API is not running
  const winners =
    apiWinners !== null
      ? (apiWinners as Record<string, unknown>[]).map(apiWinnerToCardProps)
      : QUALIFIED_BUSINESSES.map((b) => ({
          slug: b.slug,
          name: b.name,
          category: b.category,
          neighborhood: b.neighborhood,
          googleRating: b.googleRating,
          googleReviewCount: b.googleReviewCount,
          tier: b.tier,
          year: b.year,
        }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy mb-2">
          {brand.year} Winners — {brand.city}
        </h1>
        <p className="text-gray-500">
          {winners.length} businesses recognized for excellence
        </p>
      </div>

      <Suspense>
        <WinnersFilters areas={areas} categories={categories} />
      </Suspense>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {winners.map((b) => (
          <BusinessCard key={b.slug} {...b} />
        ))}
        {winners.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">
            No winners found for this filter.
          </p>
        )}
      </div>
    </div>
  );
}

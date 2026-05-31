"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  id: string;
  name: string;
}

interface WinnersFiltersProps {
  areas: FilterOption[];
  categories: FilterOption[];
}

export function WinnersFilters({ areas, categories }: WinnersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/winners?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <select
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy"
        value={searchParams.get("area_id") ?? ""}
        onChange={(e) => updateParam("area_id", e.target.value)}
      >
        <option value="">All Areas</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-navy"
        value={searchParams.get("category_id") ?? ""}
        onChange={(e) => updateParam("category_id", e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

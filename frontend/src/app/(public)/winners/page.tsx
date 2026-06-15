import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { WinnersClient } from "./WinnersClient";

export const metadata: Metadata = {
  title: `${brand.year} Winners`,
  description: `Browse ${brand.year} ${brand.name} award recipients`,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Winner {
  id: string;
  slug: string;
  name: string;
  area_name: string | null;
  category_name: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  tier: "basic" | "pro" | "premium";
  year: number;
}

export default async function WinnersPage() {
  let winners: Winner[] = [];
  try {
    const res = await fetch(
      `${API_URL}/api/v1/winners?year=${brand.year}&limit=100`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      winners = data.results ?? [];
    }
  } catch {
    // show empty state
  }

  return <WinnersClient winners={winners} />;
}

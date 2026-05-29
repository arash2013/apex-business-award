import Link from "next/link";
import { AwardBadge } from "./AwardBadge";
import { brand } from "@/config/brand";

export interface BusinessCardProps {
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  googleRating: number;
  googleReviewCount: number;
  tier?: "basic" | "pro" | "premium";
  year?: number;
}

export function BusinessCard({
  slug,
  name,
  category,
  neighborhood,
  googleRating,
  googleReviewCount,
  tier,
  year = brand.year,
}: BusinessCardProps) {
  const hasProfile = tier === "pro" || tier === "premium";

  const card = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4 hover:shadow-md transition-shadow">
      <AwardBadge category={category} year={year} size="sm" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-navy truncate">{name}</h3>
        <p className="text-sm text-gray-500">{category} · {neighborhood}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-gold font-bold">{googleRating.toFixed(1)}</span>
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-xs text-gray-400">({googleReviewCount.toLocaleString()})</span>
        </div>
        {tier && (
          <span
            className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
              tier === "premium"
                ? "bg-navy text-gold"
                : tier === "pro"
                ? "bg-gold-50 text-gold-700 border border-gold-400"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tier}
          </span>
        )}
      </div>
    </div>
  );

  return hasProfile ? (
    <Link href={`/winners/${slug}`}>{card}</Link>
  ) : (
    card
  );
}

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

const TIER_LABELS: Record<string, string> = {
  premium: "Premium",
  pro: "Pro",
  basic: "Basic",
};

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
    <div
      className={`group bg-white rounded-xl border p-5 flex gap-4 transition-all duration-200 ${
        hasProfile
          ? "border-gray-100 hover:border-gold/50 hover:shadow-md"
          : "border-gray-100"
      }`}
    >
      <AwardBadge category={category} year={year} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3
            className={`font-semibold text-navy text-sm leading-snug ${
              hasProfile ? "group-hover:text-gold transition-colors" : ""
            }`}
          >
            {name}
          </h3>
          {tier && (
            <span
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                tier === "premium"
                  ? "bg-navy text-gold"
                  : tier === "pro"
                  ? "bg-gold-50 text-gold-700 border border-gold-400"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {TIER_LABELS[tier] ?? tier}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{category} · {neighborhood}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-gold font-bold text-sm">{googleRating.toFixed(1)}</span>
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs text-gray-400">({googleReviewCount.toLocaleString()} reviews)</span>
        </div>
        {hasProfile && (
          <span className="inline-block text-xs text-gold/70 mt-2 font-medium group-hover:text-gold transition-colors">
            View profile →
          </span>
        )}
      </div>
    </div>
  );

  return hasProfile ? (
    <Link href={`/winners/${slug}`} className="block">{card}</Link>
  ) : (
    card
  );
}

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
    <div
      className={`group bg-white rounded-xl border p-5 flex gap-4 transition-all duration-300 relative overflow-hidden ${
        hasProfile
          ? "border-cream-200 hover:border-gold/40 hover:shadow-lg"
          : "border-cream-200"
      }`}
    >
      {/* Gold left accent — appears on hover for profile cards */}
      {hasProfile && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <AwardBadge category={category} year={year} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3
            className={`font-semibold text-navy text-sm leading-snug ${
              hasProfile ? "group-hover:text-gold transition-colors duration-200" : ""
            }`}
          >
            {name}
          </h3>
          {tier === "premium" && (
            <span className="badge-tier-premium shrink-0">Premium</span>
          )}
          {tier === "pro" && (
            <span className="badge-tier-pro shrink-0">Pro</span>
          )}
          {tier === "basic" && (
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium bg-cream-100 text-gray-400">
              Basic
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-0.5">{category} · {neighborhood}</p>

        <div className="flex items-center gap-1.5 mt-2.5">
          <svg className="w-3 h-3 text-gold fill-current shrink-0" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-gold font-bold text-sm">{googleRating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({googleReviewCount.toLocaleString()} reviews)</span>
        </div>

        {hasProfile && (
          <span className="inline-block text-[11px] text-gray-400 mt-2.5 font-medium group-hover:text-gold transition-colors duration-200 tracking-wide">
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

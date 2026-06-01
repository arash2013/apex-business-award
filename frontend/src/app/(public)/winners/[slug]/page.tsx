import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { brand, awardName } from "@/config/brand";
import { AwardBadge } from "@/components/AwardBadge";
import { SEED_BUSINESSES } from "@/lib/seed-data";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return SEED_BUSINESSES.filter(
    (b) => b.tier === "pro" || b.tier === "premium"
  ).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const biz = SEED_BUSINESSES.find((b) => b.slug === params.slug);
  if (!biz) return {};
  return {
    title: `${biz.name} — ${brand.name} Winner`,
    description: `${biz.name} is a ${brand.year} ${brand.name} winner in ${biz.category} · ${biz.neighborhood}`,
  };
}

export default function BusinessProfilePage({ params }: Props) {
  const biz = SEED_BUSINESSES.find((b) => b.slug === params.slug);

  if (!biz || (biz.tier !== "pro" && biz.tier !== "premium")) notFound();

  const fullAwardName = awardName(biz.category, biz.year ?? brand.year, biz.neighborhood);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/winners"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors mb-8 group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Winners
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <AwardBadge category={biz.category} year={biz.year} size="lg" />
        <div className="flex-1">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">
            {fullAwardName}
          </p>
          <h1 className="text-4xl font-bold text-navy mb-2 leading-tight">{biz.name}</h1>
          <p className="text-gray-500 text-sm">{biz.address}</p>
          <p className="text-gray-500 text-sm">{biz.phone}</p>
          {biz.website && (
            <a
              href={biz.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-sm hover:underline mt-1 inline-block"
            >
              {biz.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
      </div>

      {/* Qualification score */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Qualification Score
          </p>
          <span className="text-2xl font-bold text-navy">
            {biz.qualificationScore.toFixed(1)}
            <span className="text-sm text-gray-300 font-normal">/100</span>
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${biz.qualificationScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Based on Google rating, review count, recency, owner engagement, and Yelp cross-reference
        </p>
      </div>

      {/* Ratings */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Google Reviews</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-navy">{biz.googleRating.toFixed(1)}</span>
            <span className="text-yellow-400 text-xl">★</span>
          </div>
          <p className="text-sm text-gray-400">{biz.googleReviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Yelp Reviews</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-navy">{biz.yelpRating.toFixed(1)}</span>
            <span className="text-red-500 text-xl">★</span>
          </div>
          <p className="text-sm text-gray-400">{biz.yelpReviewCount.toLocaleString()} reviews</p>
        </div>
      </div>

      {/* Embed badge snippet */}
      <div className="bg-navy rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Embed Your Badge</h2>
          <span className="text-white/30 text-xs">Copy the snippet below</span>
        </div>
        <pre className="bg-black/30 text-gold text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
          {`<a href="https://${brand.domain}/winners/${biz.slug}" target="_blank">\n  <img src="https://${brand.domain}/api/badge/${biz.slug}" alt="${fullAwardName}" width="120" />\n</a>`}
        </pre>
      </div>

      {/* Upgrade CTA for Pro tier */}
      {biz.tier === "pro" && (
        <div className="rounded-xl border-2 border-gold/30 bg-gold-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-navy mb-1">Upgrade to Premium</p>
            <p className="text-sm text-gray-500">
              Add a physical award plaque mailed to your business.
            </p>
          </div>
          <Link href="/apply" className="btn-gold shrink-0 text-sm">
            Upgrade — $697
          </Link>
        </div>
      )}
    </div>
  );
}

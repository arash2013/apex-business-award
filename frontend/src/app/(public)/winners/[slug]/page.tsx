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
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors mb-10 group"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12">
        <AwardBadge category={biz.category} year={biz.year} size="lg" />
        <div className="flex-1">
          <p className="section-eyebrow mb-2">{fullAwardName}</p>
          <h1 className="heading-display text-4xl font-bold text-navy mb-3 leading-tight">{biz.name}</h1>
          <p className="text-gray-500 text-sm">{biz.address}</p>
          <p className="text-gray-500 text-sm">{biz.phone}</p>
          {biz.website && (
            <a
              href={biz.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-sm hover:underline mt-1.5 inline-block"
            >
              {biz.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
      </div>

      {/* Qualification score */}
      <div className="card-luxury p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Qualification Score</p>
          <span className="heading-display text-2xl font-bold text-navy">
            {biz.qualificationScore.toFixed(1)}
            <span className="text-sm text-gray-300 font-normal ml-0.5">/100</span>
          </span>
        </div>
        <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${biz.qualificationScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2.5">
          Based on Google rating, review count, recency, and owner engagement
        </p>
      </div>

      {/* Google rating */}
      <div className="card-luxury p-6 mb-5">
        <p className="section-label mb-3">Google Reviews</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="heading-display text-4xl font-bold text-navy">{biz.googleRating.toFixed(1)}</span>
          <svg className="w-5 h-5 text-gold fill-current" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">{biz.googleReviewCount.toLocaleString()} reviews</p>
      </div>

      {/* Embed badge snippet */}
      <div
        className="rounded-xl p-6 mb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F1D35 0%, #1B2B4B 100%)" }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Embed Your Badge</h2>
          <span className="text-white/25 text-xs uppercase tracking-widest">Copy snippet</span>
        </div>
        <pre className="bg-black/30 text-gold text-xs rounded-lg p-4 overflow-x-auto leading-relaxed border border-white/5">
          {`<a href="https://${brand.domain}/winners/${biz.slug}" target="_blank">\n  <img src="https://${brand.domain}/api/badge/${biz.slug}" alt="${fullAwardName}" width="120" />\n</a>`}
        </pre>
      </div>

      {/* Upgrade CTA for Pro tier */}
      {biz.tier === "pro" && (
        <div className="relative p-[1px] rounded-xl overflow-hidden">
          <div className="premium-shimmer absolute inset-0 rounded-xl opacity-50" aria-hidden="true" />
          <div className="relative rounded-[11px] bg-gold-50 border border-gold/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-navy mb-1">Upgrade to Premium</p>
              <p className="text-sm text-gray-500">
                Add a physical award plaque mailed directly to your business.
              </p>
            </div>
            <Link href="/apply" className="btn-gold shrink-0 text-sm px-5 py-2.5">
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand, awardName } from "@/config/brand";
import { AwardBadge } from "@/components/AwardBadge";
import { SEED_BUSINESSES } from "@/lib/seed-data";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return SEED_BUSINESSES.filter((b) => b.tier !== "basic").map((b) => ({
    slug: b.slug,
  }));
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

  if (!biz || biz.tier === "basic") notFound();

  const fullAwardName = awardName(biz.category, biz.year ?? brand.year, biz.neighborhood);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <AwardBadge category={biz.category} year={biz.year} size="lg" />
        <div>
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-1">
            {fullAwardName}
          </p>
          <h1 className="text-4xl font-bold text-navy mb-2">{biz.name}</h1>
          <p className="text-gray-500">{biz.address}</p>
          <p className="text-gray-500">{biz.phone}</p>
        </div>
      </div>

      {/* Ratings */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Google</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-navy">{biz.googleRating.toFixed(1)}</span>
            <span className="text-yellow-400 text-xl">★</span>
          </div>
          <p className="text-sm text-gray-500">{biz.googleReviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Yelp</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-navy">{biz.yelpRating.toFixed(1)}</span>
            <span className="text-red-500 text-xl">★</span>
          </div>
          <p className="text-sm text-gray-500">{biz.yelpReviewCount.toLocaleString()} reviews</p>
        </div>
      </div>

      {/* Embed badge snippet */}
      <div className="bg-navy rounded-xl p-6">
        <h2 className="text-white font-semibold mb-3">Embed Your Badge</h2>
        <pre className="bg-black/30 text-gold text-xs rounded-lg p-4 overflow-x-auto">
          {`<a href="https://${brand.domain}/winners/${biz.slug}" target="_blank">
  <img src="https://${brand.domain}/api/badge/${biz.slug}" alt="${fullAwardName}" width="120" />
</a>`}
        </pre>
      </div>
    </div>
  );
}

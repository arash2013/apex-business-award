import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About",
  description: `Learn how ${brand.name} selects and recognizes top local businesses.`,
};

const CRITERIA = [
  { label: "Google Rating", detail: "≥ 4.0 stars · all-time (hard cutoff)", pts: 40, max: 40, note: "Hard cutoff" },
  { label: "Review Volume", detail: "≥ 50 reviews · all-time (hard cutoff)", pts: 30, max: 40, note: "Hard cutoff" },
  { label: "Review Recency", detail: "At least 1 review within 12 months", pts: 20, max: 20, note: "3 mo = 20, 6 mo = 15, 12 mo = 10" },
  { label: "Owner Engagement", detail: "Response rate · based on last 90 days", pts: 10, max: 10, note: "Scored, not a cutoff" },
];

const FAQS = [
  {
    q: "How often are businesses evaluated?",
    a: "We run discovery crawls continuously. Qualification scores are refreshed quarterly.",
  },
  {
    q: "Can I nominate my own business?",
    a: "Yes — use the qualification checker to run an instant check. Meeting the criteria automatically qualifies you.",
  },
  {
    q: "Is this pay-to-win?",
    a: "No. Payment only unlocks the award package (badge, certificate, plaque). The qualification decision is based solely on review data — businesses cannot pay to qualify.",
  },
  {
    q: "What data sources do you use?",
    a: "We use Google Places and the Google Maps API. All ratings and review counts are drawn from publicly available Google data.",
  },
  {
    q: "How long is an award valid?",
    a: "Awards are issued annually. Each year's cohort is evaluated fresh, so a business must maintain its rating and review standards to be recognized again.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page header */}
      <div className="mb-14">
        <p className="section-eyebrow mb-3">Our Standard</p>
        <h1 className="heading-display text-5xl font-bold text-navy mb-5 leading-tight">
          How We Select
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
          {brand.name} identifies and recognizes the highest-rated local
          businesses using verified, publicly available Google data. Our process
          is transparent, data-driven, and fully automated.
        </p>
      </div>

      {/* Scoring criteria */}
      <h2 className="heading-display text-2xl font-bold text-navy mb-1">Selection Criteria</h2>
      <div className="gold-rule mb-6 max-w-[8rem]">
        <svg width="5" height="5" viewBox="0 0 5 5" fill="#C9A84C" aria-hidden="true">
          <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm mb-7">
        Each business receives a composite score out of 100. Hard cutoffs must be met before any score is calculated.
      </p>

      <div className="space-y-3 mb-16">
        {CRITERIA.map(({ label, detail, pts, max, note }) => (
          <div key={label} className="card-luxury p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-navy text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
              </div>
              <span className="badge-gold shrink-0">up to {pts} pts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-cream-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gold" style={{ width: `${(pts / max) * 100}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 w-28 text-right shrink-0">{note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="heading-display text-2xl font-bold text-navy mb-6">Frequently Asked Questions</h2>
      <div className="border border-cream-200 rounded-xl overflow-hidden mb-14 bg-white">
        {FAQS.map(({ q, a }, i) => (
          <div
            key={q}
            className={`p-5 ${i < FAQS.length - 1 ? "border-b border-cream-100" : ""}`}
          >
            <p className="font-semibold text-navy text-sm mb-1.5">{q}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="hero-texture rounded-2xl p-10 text-center text-white relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <p className="section-eyebrow mb-3">Free · Instant</p>
        <h3 className="heading-display text-2xl font-bold mb-3">Check Your Business</h3>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">
          See if your business meets the {brand.year} qualification criteria.
        </p>
        <Link href="/apply" className="btn-gold inline-block px-8">
          Run a Free Check
        </Link>
      </div>
    </div>
  );
}

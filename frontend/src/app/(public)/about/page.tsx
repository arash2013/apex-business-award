import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About",
  description: `Learn how ${brand.name} selects and recognizes top local businesses.`,
};

const CRITERIA = [
  { label: "Google Rating", detail: "≥ 4.0 stars (hard cutoff)", pts: 35, note: "Hard cutoff" },
  { label: "Review Volume", detail: "≥ 50 reviews (hard cutoff)", pts: 25, note: "Hard cutoff" },
  { label: "Review Recency", detail: "Most recent review within 12 months", pts: 20, note: "3 mo = 20, 6 mo = 15, 12 mo = 10" },
  { label: "Owner Engagement", detail: "Response rate to customer reviews", pts: 10, note: "Scored, not a cutoff" },
  { label: "Yelp Cross-Reference", detail: "Yelp rating ≥ 4.0 preferred", pts: 10, note: "Bonus" },
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
    a: "We use Google Places, the Google Maps API, and Yelp's platform. All ratings and review counts are drawn from these public sources.",
  },
  {
    q: "How long is an award valid?",
    a: "Awards are issued annually. Each year's cohort is evaluated fresh, so a business must maintain its rating and review standards to be recognized again.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy mb-3">{`About ${brand.name}`}</h1>
      <p className="text-gray-500 text-lg mb-12 leading-relaxed">
        {brand.name} identifies and recognizes the highest-rated local
        businesses using verified, publicly available review data from Google
        and Yelp. Our process is transparent, data-driven, and fully automated.
      </p>

      {/* Scoring criteria */}
      <h2 className="text-2xl font-bold text-navy mb-2">Selection Criteria</h2>
      <p className="text-gray-500 text-sm mb-6">
        Each business receives a composite score out of 100. Hard cutoffs must be met before any score is calculated.
      </p>
      <div className="space-y-3 mb-14">
        {CRITERIA.map(({ label, detail, pts, note }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-navy text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
              </div>
              <span className="badge-gold shrink-0">up to {pts} pts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pts}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 w-28 text-right shrink-0">{note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-navy mb-6">Frequently Asked Questions</h2>
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-12">
        {FAQS.map(({ q, a }, i) => (
          <div
            key={q}
            className={`p-5 bg-white ${i < FAQS.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <p className="font-semibold text-navy text-sm mb-1.5">{q}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-brand rounded-2xl p-8 text-center text-white">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">
          Free · Instant
        </p>
        <h3 className="text-2xl font-bold mb-2">Check Your Business</h3>
        <p className="text-white/70 text-sm mb-6 max-w-xs mx-auto">
          See if your business meets the {brand.year} qualification criteria.
        </p>
        <Link href="/apply" className="btn-gold inline-block">
          Run a Free Check
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About",
  description: `Learn how ${brand.name} selects and recognizes top local businesses.`,
};

const CRITERIA = [
  { label: "Google Rating", detail: "≥ 4.0 stars (hard cutoff)", pts: "Up to 35 pts" },
  { label: "Review Volume", detail: "≥ 50 reviews (hard cutoff)", pts: "Up to 25 pts" },
  { label: "Review Recency", detail: "At least one review within 12 months", pts: "Up to 20 pts" },
  { label: "Owner Engagement", detail: "Response rate to customer reviews", pts: "Up to 10 pts" },
  { label: "Yelp Cross-Reference", detail: "Yelp rating ≥ 4.0 preferred", pts: "Up to 10 pts" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy mb-4">{`About ${brand.name}`}</h1>
      <p className="text-gray-600 text-lg mb-10">
        {brand.name} identifies and recognizes the highest-rated local
        businesses using verified, publicly available review data from Google
        and Yelp. Our process is transparent, data-driven, and fully automated.
      </p>

      <h2 className="text-2xl font-bold text-navy mb-4">Selection Criteria</h2>
      <p className="text-gray-600 mb-6">
        Each business receives a composite score out of 100. Both hard cutoffs
        must be met before any score is calculated.
      </p>
      <div className="space-y-3 mb-12">
        {CRITERIA.map(({ label, detail, pts }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-start gap-4"
          >
            <div>
              <p className="font-semibold text-navy">{label}</p>
              <p className="text-sm text-gray-500">{detail}</p>
            </div>
            <span className="badge-gold shrink-0">{pts}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-navy mb-4">FAQ</h2>
      <div className="space-y-6">
        {[
          {
            q: "How often are businesses evaluated?",
            a: "We run discovery crawls continuously. Qualification scores are refreshed quarterly.",
          },
          {
            q: "Can I nominate my own business?",
            a: "Yes — use the /apply page to run an instant qualification check. Meeting the criteria automatically qualifies you.",
          },
          {
            q: "Is this pay-to-win?",
            a: "No. Payment only unlocks the award package (badge, certificate, plaque). The qualification decision is based solely on review data — businesses cannot pay to qualify.",
          },
          {
            q: "What data sources do you use?",
            a: "We use Google Places, the Google Maps API, and Yelp's platform. All ratings and review counts are drawn from these public sources.",
          },
        ].map(({ q, a }) => (
          <div key={q}>
            <p className="font-semibold text-navy mb-1">{q}</p>
            <p className="text-gray-600 text-sm">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

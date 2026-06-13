import type { Metadata } from "next";
import { brand } from "@/config/brand";
import QualifyForm from "./QualifyForm";

export const metadata: Metadata = {
  title: "Check Your Qualification",
  description: `See if your business qualifies for a ${brand.year} ${brand.name}.`,
};

const STEPS = [
  {
    n: "1",
    title: "Find your listing",
    desc: "Search for your business on Google Maps.",
  },
  {
    n: "2",
    title: "Copy the URL",
    desc: "Copy the full URL from your browser's address bar.",
  },
  {
    n: "3",
    title: "Paste below",
    desc: `We'll score you against the ${brand.year} criteria instantly.`,
  },
];

const CRITERIA = [
  { label: "Google rating", req: "≥ 4.0 stars · all-time", pts: "up to 40 pts" },
  { label: "Review count", req: "≥ 50 reviews · all-time", pts: "up to 30 pts" },
  { label: "Review recency", req: "at least 1 review within 12 months", pts: "up to 20 pts" },
  { label: "Owner response rate", req: "based on last 90 days of reviews", pts: "up to 10 pts" },
];

export default function ApplyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">
          Free · Instant · No Account Required
        </p>
        <h1 className="text-4xl font-bold text-navy mb-3">
          Check Your Qualification
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Paste your Google Maps business URL and we&apos;ll score your business
          against the {brand.year} criteria.
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row gap-5 mb-10">
        {STEPS.map(({ n, title, desc }) => (
          <div key={n} className="flex-1 flex gap-3">
            <div className="w-6 h-6 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {n}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">{title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form + results */}
      <QualifyForm />

      {/* What we check */}
      <div className="rounded-xl bg-white border border-gray-100 p-5">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
          What We Check
        </p>
        <div className="space-y-2.5">
          {CRITERIA.map(({ label, req, pts }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-navy font-medium w-36 shrink-0">{label}</span>
              <span className="text-gray-400 flex-1">{req}</span>
              <span className="text-gold font-semibold shrink-0">{pts}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
        Qualification is based on publicly available Google data.
        Results are generated in real time. Checking is always free.
      </p>
    </div>
  );
}

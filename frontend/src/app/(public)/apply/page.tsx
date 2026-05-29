import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Check Your Qualification",
  description: `See if your business qualifies for a ${brand.year} ${brand.name}.`,
};

export default function ApplyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-navy mb-3">
          Check Your Qualification
        </h1>
        <p className="text-gray-500">
          Paste your Google Maps business URL and we&apos;ll run an instant
          qualification check against the {brand.year} criteria.
        </p>
      </div>

      {/* Form — server action to be wired up */}
      <form className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Google Maps URL
          </label>
          <input
            type="url"
            name="google_maps_url"
            placeholder="https://maps.google.com/?cid=..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="text-xs text-gray-400 mt-1">
            Open Google Maps, find your business, and copy the URL from your
            browser.
          </p>
        </div>
        <button type="submit" className="btn-primary w-full">
          Check Qualification
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Qualification is based on publicly available Google and Yelp data.
        Results are generated in real time.
      </p>
    </div>
  );
}

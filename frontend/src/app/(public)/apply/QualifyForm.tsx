"use client";

import { useState } from "react";
import { brand } from "@/config/brand";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface QualifyResult {
  business_name: string;
  business_address: string;
  score: number;
  qualified: boolean;
  breakdown: Record<string, number>;
  disqualification_reasons: string[];
  google_rating: number | null;
  google_review_count: number | null;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  google_rating: "Google Rating",
  review_count: "Review Count",
  recency: "Review Recency",
  owner_response_rate: "Owner Response Rate",
  yelp_bonus: "Yelp Cross-reference",
};

const BREAKDOWN_MAX: Record<string, number> = {
  google_rating: 35,
  review_count: 25,
  recency: 20,
  owner_response_rate: 10,
  yelp_bonus: 10,
};

export default function QualifyForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/qualify/by-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_maps_url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.detail ?? "Something went wrong. Please check the URL and try again."
        );
      }

      const data: QualifyResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5 mb-6"
      >
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Google Maps URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.google.com/maps/place/..."
            className="input-base"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Open <strong className="text-navy">Google Maps</strong>, find your
            business, click your listing, and copy the URL from the address bar.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Checking…" : "Run Qualification Check"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-5 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-2xl border shadow-sm overflow-hidden mb-6">
          {/* Header */}
          <div
            className={`p-6 ${result.qualified ? "bg-navy text-white" : "bg-gray-50 text-gray-700"}`}
          >
            <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-1">
              {result.qualified ? "🎉 Congratulations" : "Not Qualified Yet"}
            </p>
            <h2 className="text-xl font-bold mb-0.5">{result.business_name}</h2>
            <p className="text-xs opacity-60">{result.business_address}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-bold">
                {Math.round(result.score)}
              </span>
              <span className="text-sm opacity-70">/ 100 pts</span>
              {result.qualified && (
                <span className="ml-auto text-xs bg-gold text-navy font-bold px-3 py-1 rounded-full">
                  Qualifies for {brand.year} Award
                </span>
              )}
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white p-6 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">
              Score Breakdown
            </p>
            {Object.entries(result.breakdown).map(([key, pts]) => {
              const max = BREAKDOWN_MAX[key] ?? 35;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="text-navy font-medium w-44 shrink-0">
                    {BREAKDOWN_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full"
                      style={{ width: `${Math.min(100, (pts / max) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                    {pts} / {max} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Disqualification reasons */}
          {result.disqualification_reasons.length > 0 && (
            <div className="bg-red-50 border-t border-red-100 p-6">
              <p className="text-xs text-red-500 uppercase tracking-widest font-medium mb-2">
                Hard Cutoffs Not Met
              </p>
              <ul className="space-y-1">
                {result.disqualification_reasons.map((r) => (
                  <li key={r} className="text-sm text-red-700 flex gap-2">
                    <span>✕</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          {result.qualified && (
            <div className="bg-white border-t border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Your business meets the {brand.year} criteria. Secure your award today.
              </p>
              <a href="/#pricing" className="btn-primary">
                View Award Packages
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}

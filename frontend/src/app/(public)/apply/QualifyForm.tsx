"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { brand } from "@/config/brand";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Suggestion {
  place_id: string;
  name: string;
  address: string;
}

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
};

const BREAKDOWN_MAX: Record<string, number> = {
  google_rating: 40,
  review_count: 30,
  recency: 20,
  owner_response_rate: 10,
};

export default function QualifyForm() {
  // ── Search mode state ──────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // ── URL fallback state ─────────────────────────────────────────
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // ── Shared state ───────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/qualify/autocomplete?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setDropdownOpen(data.length > 0);
      }
    } catch {
      // best-effort
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setResult(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  async function handleSelect(s: Suggestion) {
    setQuery(s.name);
    setDropdownOpen(false);
    setSuggestions([]);
    setResult(null);
    setError(null);
    await qualifyByPlaceId(s.place_id);
  }

  async function qualifyByPlaceId(place_id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/qualify/by-place-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail ?? "Something went wrong. Please try again.");
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setUrlLoading(true);
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
        throw new Error(data?.detail ?? "Something went wrong. Please check the link and try again.");
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setUrlLoading(false);
    }
  }

  function handleClear() {
    setQuery("");
    setUrl("");
    setSuggestions([]);
    setDropdownOpen(false);
    setResult(null);
    setError(null);
  }

  function switchMode(toUrl: boolean) {
    setUrlMode(toUrl);
    handleClear();
  }

  const isLoading = loading || urlLoading;

  return (
    <>
      {/* ── Input card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-8 mb-6">

        {/* Mode toggle */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-cream-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              !urlMode ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
            }`}
          >
            Search by name
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              urlMode ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
            }`}
          >
            Paste a link
          </button>
        </div>

        {/* ── Search mode ── */}
        {!urlMode && (
          <div ref={wrapperRef}>
            <label className="block text-sm font-semibold text-navy mb-2">
              Business Name
            </label>
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
                placeholder="Type your business name…"
                className="input-base pl-10 pr-10"
                autoComplete="off"
                disabled={isLoading}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {searching || loading ? (
                  <svg className="w-4 h-4 text-gold animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : query ? (
                  <button onClick={handleClear} className="text-gray-400 hover:text-navy transition-colors" type="button" aria-label="Clear">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>

              {dropdownOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1.5 bg-white rounded-xl border border-cream-200 shadow-xl overflow-hidden">
                  {suggestions.map((s) => (
                    <li key={s.place_id}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                        className="w-full text-left px-4 py-3 hover:bg-gold-50 transition-colors flex items-start gap-3 group"
                      >
                        <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy truncate group-hover:text-gold transition-colors">{s.name}</p>
                          {s.address && <p className="text-xs text-gray-400 truncate mt-0.5">{s.address}</p>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">
              Start typing — we&apos;ll search Google to find your listing.
              {" "}
              <button
                type="button"
                onClick={() => switchMode(true)}
                className="text-gold hover:underline font-medium"
              >
                Can&apos;t find it? Paste a Google link instead →
              </button>
            </p>
          </div>
        )}

        {/* ── URL / share link mode ── */}
        {urlMode && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Google Maps Link
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); setResult(null); }}
                placeholder="https://share.google/… or https://maps.app.goo.gl/… or full Maps URL"
                className="input-base"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Paste any Google link: a Share link, a maps.app.goo.gl short link, or the full URL from your browser.
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {urlLoading ? "Checking…" : "Run Qualification Check"}
            </button>
          </form>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-5 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {isLoading && !result && (
        <div className="rounded-2xl border border-cream-200 shadow-sm p-6 mb-6 animate-pulse space-y-3">
          <div className="h-4 bg-cream-200 rounded w-1/3" />
          <div className="h-8 bg-cream-200 rounded w-1/2" />
          <div className="h-2 bg-cream-200 rounded w-full mt-4" />
          <div className="h-2 bg-cream-200 rounded w-4/5" />
          <div className="h-2 bg-cream-200 rounded w-3/5" />
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────── */}
      {result && (
        <div className="rounded-2xl border border-cream-200 shadow-sm overflow-hidden mb-6">
          <div className={`p-6 relative ${result.qualified ? "hero-texture" : "bg-gray-50"}`}>
            {result.qualified && (
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            )}
            <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${result.qualified ? "text-gold" : "text-gray-400"}`}>
              {result.qualified ? "Congratulations" : "Not Qualified Yet"}
            </p>
            <h2 className={`heading-display text-xl font-bold mb-0.5 ${result.qualified ? "text-white" : "text-navy"}`}>
              {result.business_name}
            </h2>
            {result.business_address && (
              <p className={`text-xs ${result.qualified ? "text-white/50" : "text-gray-400"}`}>
                {result.business_address}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <span className={`heading-display text-4xl font-bold ${result.qualified ? "text-white" : "text-navy"}`}>
                {Math.round(result.score)}
              </span>
              <span className={`text-sm ${result.qualified ? "text-white/60" : "text-gray-400"}`}>
                / 100 pts
              </span>
              {result.qualified && (
                <span className="ml-auto text-xs bg-gold text-navy font-bold px-3 py-1 rounded-full">
                  {brand.year} Award Eligible
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 space-y-3">
            <p className="section-label mb-3">Score Breakdown</p>
            {Object.entries(result.breakdown).map(([key, pts]) => {
              const max = BREAKDOWN_MAX[key] ?? 40;
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <span className="text-navy font-medium w-44 shrink-0 text-xs">
                    {BREAKDOWN_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 bg-cream-200 rounded-full h-1.5">
                    <div
                      className="bg-gold h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (pts / max) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                    {pts} / {max}
                  </span>
                </div>
              );
            })}
          </div>

          {result.disqualification_reasons.length > 0 && (
            <div className="bg-red-50 border-t border-red-100 p-5">
              <p className="text-xs text-red-500 uppercase tracking-widest font-medium mb-2">
                Hard Cutoffs Not Met
              </p>
              <ul className="space-y-1">
                {result.disqualification_reasons.map((r) => (
                  <li key={r} className="text-sm text-red-700 flex gap-2">
                    <span className="shrink-0">✕</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.qualified && (
            <div className="bg-white border-t border-cream-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Your business meets the {brand.year} criteria. Secure your award today.
              </p>
              <a href="/#pricing" className="btn-primary inline-block">
                View Award Packages
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}

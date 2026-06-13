import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import Link from "next/link";
import { SEED_BUSINESSES, QUALIFIED_BUSINESSES } from "@/lib/seed-data";

const STATS = [
  { value: String(QUALIFIED_BUSINESSES.length), label: "Qualified Businesses" },
  { value: String([...new Set(QUALIFIED_BUSINESSES.map((b) => b.category))].length), label: "Categories" },
  { value: brand.city, label: "Launch City" },
  { value: String(brand.year), label: "Award Year" },
];

const STEPS = [
  {
    num: "I",
    title: "Discovered",
    desc: "We analyze thousands of businesses using verified Google data — ratings, review volume, recency, and owner engagement.",
  },
  {
    num: "II",
    title: "Qualified",
    desc: "Only businesses that clear every hard cutoff receive a composite score. The bar is intentionally high.",
  },
  {
    num: "III",
    title: "Recognized",
    desc: "Winners receive a digital badge, certificate, and optional physical plaque to showcase their distinction.",
  },
];

export default function HomePage() {
  const featured = SEED_BUSINESSES.filter(
    (b) => b.qualified && (b.tier === "pro" || b.tier === "premium")
  ).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-texture text-white py-28 px-4 relative overflow-hidden">
        {/* Subtle radial vignette at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="h-px w-8 bg-gold/50" />
            <p className="section-eyebrow">{brand.city}, {brand.state} · {brand.year}</p>
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <h1 className="heading-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-[1.05]">
            {brand.tagline}
          </h1>

          <p className="text-white/65 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            We identify the highest-rated local businesses using verified Google
            data — then recognize their excellence with distinction.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/apply" className="btn-gold text-center px-8">
              Check Your Business
            </Link>
            <Link
              href="/winners"
              className="border border-white/25 text-white/80 px-8 py-3 rounded-lg font-semibold hover:bg-white/8 hover:text-white hover:border-white/40 transition-all text-center"
            >
              Browse Winners
            </Link>
          </div>

          {/* Bottom ornament */}
          <div className="mt-14 flex items-center justify-center gap-4 opacity-20">
            <span className="h-px w-16 bg-gold" />
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#C9A84C" aria-hidden="true">
              <rect x="4" y="0" width="2" height="10" />
              <rect x="0" y="4" width="10" height="2" />
            </svg>
            <span className="h-px w-16 bg-gold" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section className="bg-navy-900 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-6 px-6 text-center">
                <p className="text-gold font-bold text-2xl heading-display">{value}</p>
                <p className="text-white/35 text-[11px] uppercase tracking-widest mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-3">The Process</p>
            <h2 className="heading-display text-4xl font-bold text-navy">
              A Standard Worth Earning
            </h2>
            <div className="gold-rule mt-5 max-w-xs mx-auto">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="#C9A84C" aria-hidden="true">
                <polygon points="3,0 6,3 3,6 0,3" />
              </svg>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "radial-gradient(ellipse at 50% 30%, #243660, #1B2B4B)",
                    border: "1.5px solid #C9A84C55",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <span className="heading-display text-gold font-bold text-lg">{num}</span>
                </div>
                <h3 className="font-bold text-navy text-lg mb-3 heading-display">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/about" className="text-gold text-sm hover:underline font-medium tracking-wide">
              Learn more about our selection criteria →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Winners ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow mb-2">{brand.city}, {brand.state}</p>
              <h2 className="heading-display text-3xl font-bold text-navy">{brand.year} Award Recipients</h2>
            </div>
            <Link href="/winners" className="text-gold hover:underline text-sm font-semibold hidden sm:block">
              View all {QUALIFIED_BUSINESSES.length} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((b) => (
              <BusinessCard key={b.slug} {...b} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/winners" className="text-gold hover:underline text-sm font-semibold">
              View all {QUALIFIED_BUSINESSES.length} winners →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Award Packages</p>
            <h2 className="heading-display text-4xl font-bold text-navy">
              Choose Your Recognition
            </h2>
            <p className="text-gray-400 text-sm mt-3 max-w-sm mx-auto">
              Available exclusively to qualified businesses — qualification is always free
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Basic */}
            <div className="rounded-xl p-7 border border-cream-200 bg-white text-navy flex flex-col">
              <p className="section-label mb-4">Basic</p>
              <div className="heading-display text-4xl font-bold mb-1 text-navy">${brand.pricing.basic}</div>
              <p className="text-xs text-gray-400 mb-6">one-time</p>
              <ul className="space-y-3 text-sm flex-1 mb-7">
                {["Digital badge (embeddable)", "Printable PDF certificate", "Directory listing"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-gold fill-current mt-0.5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block text-center border border-navy/20 text-navy font-semibold py-2.5 rounded-lg text-sm hover:bg-navy hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro — most popular */}
            <div
              className="rounded-xl p-7 border-2 border-gold bg-navy text-white shadow-2xl md:-translate-y-2 flex flex-col"
              style={{ boxShadow: "0 25px 60px -10px rgba(27,43,75,0.5)" }}
            >
              <div className="section-eyebrow mb-4">★ Most Popular</div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-medium">Pro</p>
              <div className="heading-display text-4xl font-bold mb-1 text-gold">${brand.pricing.pro}</div>
              <p className="text-xs text-white/35 mb-6">one-time</p>
              <ul className="space-y-3 text-sm flex-1 mb-7">
                {["Everything in Basic", "Full profile page", "Social media kit (5 images)"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-gold fill-current mt-0.5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block text-center bg-gold text-navy font-semibold py-2.5 rounded-lg text-sm hover:bg-gold-400 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Premium */}
            <div className="relative p-[2px] rounded-xl overflow-hidden shadow-2xl">
              <div className="premium-shimmer absolute inset-0 rounded-xl" aria-hidden="true" />
              <div
                className="relative rounded-[10px] p-7 text-white flex flex-col h-full"
                style={{ background: "linear-gradient(150deg, #1B2B4B 0%, #243050 60%, #8B6820 100%)" }}
              >
                <div className="flex items-center gap-1.5 mb-4">
                  <svg className="w-3.5 h-3.5 text-gold fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M3 5l7-3 7 3v8l-7 4-7-4V5z" />
                  </svg>
                  <span className="section-eyebrow" style={{ color: "#C9A84C" }}>Best Value</span>
                </div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-medium">Premium</p>
                <div className="heading-display text-4xl font-bold mb-1" style={{ color: "#C9A84C" }}>
                  ${brand.pricing.premium}
                </div>
                <p className="text-xs text-white/35 mb-6">one-time</p>
                <ul className="space-y-3 text-sm flex-1 mb-7">
                  {["Everything in Pro", "Physical award plaque", "Priority fulfillment"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 fill-current mt-0.5 shrink-0" style={{ color: "#C9A84C" }} viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className="block text-center font-bold py-2.5 rounded-lg text-sm transition-opacity hover:opacity-85"
                  style={{ background: "#C9A84C", color: "#1B2B4B" }}
                >
                  Get Started
                </Link>
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Not sure if you qualify?{" "}
            <Link href="/apply" className="text-gold hover:underline font-medium">
              Run a free qualification check →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

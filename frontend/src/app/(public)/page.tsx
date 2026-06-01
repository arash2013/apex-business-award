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

export default function HomePage() {
  const featured = SEED_BUSINESSES.filter(
    (b) => b.qualified && (b.tier === "pro" || b.tier === "premium")
  ).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-brand text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-xs uppercase tracking-widest mb-4 font-semibold">
            {brand.city}, {brand.state} · {brand.year}
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight">
            {brand.tagline}
          </h1>
          <p className="text-white/75 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            We identify the highest-rated local businesses using verified Google
            and Yelp data — then recognize their excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/winners" className="btn-gold text-center">
              Browse Winners
            </Link>
            <Link
              href="/apply"
              className="border border-white/40 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 hover:border-white/60 transition-colors text-center"
            >
              Check Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy/95 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-5 px-6 text-center">
                <p className="text-gold font-bold text-xl">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-2">
            How It Works
          </h2>
          <p className="text-gray-400 text-center text-sm mb-12">
            A transparent, data-driven process from discovery to recognition
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Qualify",
                desc: "We analyze thousands of businesses using Google and Yelp ratings, review volume, recency, and owner engagement.",
              },
              {
                step: "02",
                title: "Get Notified",
                desc: "Top-scoring businesses receive an award notification email with their full qualification breakdown.",
              },
              {
                step: "03",
                title: "Display Your Award",
                desc: "Winners receive a digital badge, certificate, and optional physical plaque to showcase their recognition.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center text-gold font-bold text-lg mx-auto mb-5 shadow-md">
                  {step}
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/about" className="text-gold text-sm hover:underline font-medium">
              Learn more about our selection criteria →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Winners */}
      <section className="py-20 px-4" style={{ background: brand.colors.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-navy">{brand.year} Winners</h2>
              <p className="text-gray-400 text-sm mt-1">{brand.city}, {brand.state}</p>
            </div>
            <Link href="/winners" className="text-gold hover:underline text-sm font-semibold">
              View all {QUALIFIED_BUSINESSES.length} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((b) => (
              <BusinessCard key={b.slug} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-2">
            Award Packages
          </h2>
          <p className="text-gray-400 text-center text-sm mb-12">
            Only available to qualified businesses — qualification is always free
          </p>
          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Basic */}
            <div className="rounded-xl p-6 border-2 border-gray-100 bg-white text-navy flex flex-col">
              <h3 className="text-xl font-bold mb-1">Basic</h3>
              <div className="text-4xl font-bold mb-1 text-navy">${brand.pricing.basic}</div>
              <p className="text-xs text-gray-400 mb-5">one-time</p>
              <ul className="space-y-2.5 text-sm flex-1 mb-6">
                {["Digital badge (embeddable)", "Printable PDF certificate", "Directory listing"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5 shrink-0">✓</span>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/apply" className="block text-center border border-navy/20 text-navy font-semibold py-2.5 rounded-lg text-sm hover:bg-navy hover:text-white transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro — most popular */}
            <div className="rounded-xl p-6 border-2 border-gold bg-navy text-white shadow-xl md:-translate-y-2 flex flex-col">
              <div className="text-gold text-[10px] uppercase tracking-widest mb-3 font-bold">
                ★ Most Popular
              </div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <div className="text-4xl font-bold mb-1" style={{ color: "#C9A84C" }}>${brand.pricing.pro}</div>
              <p className="text-xs text-white/40 mb-5">one-time</p>
              <ul className="space-y-2.5 text-sm flex-1 mb-6">
                {["Everything in Basic", "Full profile page", "Social media kit (5 images)"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5 shrink-0">✓</span>
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/apply" className="block text-center bg-gold text-navy font-semibold py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Premium — shimmer treatment */}
            <div className="relative p-[2px] rounded-xl overflow-hidden md:translate-y-0 shadow-2xl">
              <div className="premium-shimmer absolute inset-0 rounded-xl" aria-hidden="true" />
              <div
                className="relative rounded-[10px] p-6 text-white flex flex-col"
                style={{ background: "linear-gradient(135deg, #1B2B4B 0%, #A07830 100%)" }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-base">👑</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                    Best Value
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Premium</h3>
                <div className="text-4xl font-bold mb-1" style={{ color: "#C9A84C" }}>
                  ${brand.pricing.premium}
                </div>
                <p className="text-xs text-white/50 mb-5">one-time</p>
                <ul className="space-y-2.5 text-sm flex-1 mb-6">
                  {["Everything in Pro", "Physical award plaque", "Priority fulfillment"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="font-bold mt-0.5 shrink-0" style={{ color: "#C9A84C" }}>✓</span>
                      <span className="text-white">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className="block text-center font-bold py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
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

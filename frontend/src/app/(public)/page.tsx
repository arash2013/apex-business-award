import { brand } from "@/config/brand";
import { BusinessCard } from "@/components/BusinessCard";
import Link from "next/link";
import { SEED_BUSINESSES } from "@/lib/seed-data";

export default function HomePage() {
  const featured = SEED_BUSINESSES.filter((b) => b.tier !== "basic").slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-brand text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-sm uppercase tracking-widest mb-3 font-medium">
            {brand.city}, {brand.state} · {brand.year}
          </p>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            {brand.tagline}
          </h1>
          <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
            We identify the highest-rated local businesses using verified Google
            and Yelp data — then recognize their excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/winners" className="btn-gold">
              Browse Winners
            </Link>
            <Link
              href="/apply"
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Check Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-10">
            How It Works
          </h2>
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
                desc: "Top-scoring businesses receive an award notification email with their qualification details.",
              },
              {
                step: "03",
                title: "Display Your Award",
                desc: "Winners receive a digital badge, certificate, and optional physical plaque to showcase their recognition.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-navy font-bold text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Winners */}
      <section className="py-16 px-4" style={{ background: brand.colors.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-navy">
              {brand.year} Winners — {brand.city}
            </h2>
            <Link href="/winners" className="text-gold hover:underline text-sm font-medium">
              View all →
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
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-3">
            Award Packages
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Only available to qualified businesses
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Basic",
                price: "$197",
                features: [
                  "Digital badge (embeddable)",
                  "Printable PDF certificate",
                  "Directory listing",
                ],
                highlight: false,
              },
              {
                name: "Pro",
                price: "$397",
                features: [
                  "Everything in Basic",
                  "Full profile page",
                  "Social media kit (5 images)",
                ],
                highlight: true,
              },
              {
                name: "Premium",
                price: "$697",
                features: [
                  "Everything in Pro",
                  "Physical award plaque",
                  "Priority fulfillment",
                ],
                highlight: false,
              },
            ].map(({ name, price, features, highlight }) => (
              <div
                key={name}
                className={`rounded-xl p-6 border-2 ${
                  highlight
                    ? "border-gold bg-navy text-white"
                    : "border-gray-200 bg-white text-navy"
                }`}
              >
                {highlight && (
                  <div className="text-gold text-xs uppercase tracking-widest mb-2 font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <div className="text-3xl font-bold mb-4" style={{ color: highlight ? "#C9A84C" : "#1B2B4B" }}>
                  {price}
                </div>
                <ul className="space-y-2 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-gold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

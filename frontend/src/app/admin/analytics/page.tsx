import { SEED_BUSINESSES } from "@/lib/seed-data";
import { brand } from "@/config/brand";

function calcRevenue() {
  const purchased = SEED_BUSINESSES.filter(
    (b): b is typeof b & { tier: "basic" | "pro" | "premium" } =>
      b.qualified && b.tier != null
  );
  return purchased.reduce((sum, b) => sum + brand.pricing[b.tier], 0);
}

export default function AnalyticsPage() {
  const total = SEED_BUSINESSES.length;
  const qualified = SEED_BUSINESSES.filter((b) => b.qualified).length;
  const revenue = calcRevenue();

  const stats = [
    { label: "Businesses Discovered", value: total },
    { label: "Qualified", value: qualified },
    { label: "Conversion Rate", value: `${((qualified / total) * 100).toFixed(0)}%` },
    { label: "Revenue (Demo)", value: `$${revenue.toLocaleString()}` },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">By Category</h2>
          <div className="space-y-2">
            {[...new Set(SEED_BUSINESSES.map((b) => b.category))].map((cat) => {
              const count = SEED_BUSINESSES.filter((b) => b.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium text-navy">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">Funnel</h2>
          {[
            { stage: "Discovered", count: total },
            { stage: "Qualified", count: qualified },
            { stage: "Outreach Sent", count: 6 },
            { stage: "Opened", count: 4 },
            { stage: "Purchased", count: 3 },
          ].map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 w-32 shrink-0">{stage}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gold rounded-full h-2"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-navy w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

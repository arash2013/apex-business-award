import { SEED_BUSINESSES } from "@/lib/seed-data";

const STATUS_MAP: Record<string, string> = {
  "biz-001": "fulfilled",
  "biz-002": "purchased",
  "biz-003": "fulfilled",
  "biz-004": "offered",
  "biz-005": "offered",
  "biz-006": "offered",
  "biz-007": "offered",
  "biz-008": "purchased",
};

export default function AwardsPage() {
  const businesses = SEED_BUSINESSES.filter((b) => b.qualified);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Awards</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.category}</td>
                <td className="px-4 py-3 capitalize">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.tier === "premium"
                        ? "bg-navy text-gold"
                        : b.tier === "pro"
                        ? "bg-gold-50 text-gold-700 border border-gold-400"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {b.tier}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_MAP[b.id] === "fulfilled"
                        ? "bg-green-100 text-green-700"
                        : STATUS_MAP[b.id] === "purchased"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_MAP[b.id] ?? "offered"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {b.qualificationScore.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { SEED_BUSINESSES } from "@/lib/seed-data";

export default function BusinessesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Businesses</h1>
        <span className="text-sm text-gray-500">{SEED_BUSINESSES.length} total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Neighborhood</th>
              <th className="text-right px-4 py-3">G Rating</th>
              <th className="text-right px-4 py-3">Reviews</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-center px-4 py-3">Qualified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SEED_BUSINESSES.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-navy">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.category}</td>
                <td className="px-4 py-3 text-gray-500">{b.neighborhood}</td>
                <td className="px-4 py-3 text-right">
                  <span className={b.googleRating >= 4.0 ? "text-green-600 font-medium" : "text-red-500"}>
                    {b.googleRating.toFixed(1)} ★
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {b.googleReviewCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {b.qualificationScore.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-center">
                  {b.qualified ? (
                    <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

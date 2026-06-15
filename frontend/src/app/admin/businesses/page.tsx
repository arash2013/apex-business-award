import { adminFetch } from "@/lib/admin-fetch";
import type { AdminBusiness } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  let businesses: AdminBusiness[] = [];
  let error: string | null = null;
  try {
    businesses = await adminFetch<AdminBusiness[]>("/businesses");
  } catch (e) {
    error = String(e);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Businesses</h1>
        <span className="text-sm text-gray-500">{businesses.length} total</span>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Area</th>
              <th className="text-right px-4 py-3">G Rating</th>
              <th className="text-right px-4 py-3">Reviews</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-center px-4 py-3">Qualified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {businesses.length === 0 && !error && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No businesses yet.</td></tr>
            )}
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-navy">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.category_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{b.area_name ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {b.google_rating != null ? (
                    <span className={b.google_rating >= 4.0 ? "text-green-600 font-medium" : "text-red-500"}>
                      {b.google_rating.toFixed(1)} ★
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {b.google_review_count?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {b.qualification_score?.toFixed(1) ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {b.qualified ? (
                    <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">Yes</span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">No</span>
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

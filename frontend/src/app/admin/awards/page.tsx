import { adminFetch } from "@/lib/admin-fetch";
import type { AdminAward } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  let awards: AdminAward[] = [];
  let error: string | null = null;
  try {
    awards = await adminFetch<AdminAward[]>("/awards");
  } catch (e) {
    error = String(e);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Awards</h1>
        <span className="text-sm text-gray-500">{awards.length} total</span>
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
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-left px-4 py-3">Offered</th>
              <th className="text-left px-4 py-3">Purchased</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {awards.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No awards yet.
                </td>
              </tr>
            )}
            {awards.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{a.business_name}</td>
                <td className="px-4 py-3 text-gray-600">{a.category_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    a.tier === "premium" ? "bg-navy text-gold" :
                    a.tier === "pro" ? "bg-amber-50 text-amber-700 border border-amber-300" :
                    "bg-gray-100 text-gray-600"
                  }`}>{a.tier}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    a.status === "fulfilled" ? "bg-green-100 text-green-700" :
                    a.status === "purchased" ? "bg-blue-100 text-blue-700" :
                    a.status === "expired" ? "bg-red-50 text-red-400" :
                    "bg-gray-100 text-gray-500"
                  }`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {a.qualification_score?.toFixed(1) ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {a.offered_at ? new Date(a.offered_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {a.purchased_at ? new Date(a.purchased_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

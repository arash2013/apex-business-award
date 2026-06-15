import { adminFetch } from "@/lib/admin-fetch";
import type { AdminAnalytics } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let data: AdminAnalytics | null = null;
  let error: string | null = null;
  try {
    data = await adminFetch<AdminAnalytics>("/analytics");
  } catch (e) {
    error = String(e);
  }

  const conversionRate =
    data && data.businesses_discovered > 0
      ? ((data.businesses_qualified / data.businesses_discovered) * 100).toFixed(0)
      : "0";
  const revenue = data
    ? `$${(data.revenue_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
    : "$0";

  const stats = data
    ? [
        { label: "Businesses Discovered", value: data.businesses_discovered },
        { label: "Qualified", value: data.businesses_qualified },
        { label: "Conversion Rate", value: `${conversionRate}%` },
        { label: "Revenue", value: revenue },
      ]
    : [];

  const funnel = data
    ? [
        { stage: "Discovered", count: data.businesses_discovered },
        { stage: "Qualified", count: data.businesses_qualified },
        { stage: "Outreach Sent", count: data.outreach_sent },
        { stage: "Opened", count: data.outreach_opened },
        { stage: "Clicked", count: data.outreach_clicked },
        { stage: "Responded", count: data.outreach_responded },
        { stage: "Purchased", count: data.awards_purchased },
        { stage: "Fulfilled", count: data.awards_fulfilled },
      ]
    : [];

  const maxFunnel = funnel[0]?.count || 1;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Analytics</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>

      {data && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy mb-4">Award Status</h2>
            <div className="space-y-2">
              {[
                { label: "Offered", value: data.awards_offered },
                { label: "Purchased", value: data.awards_purchased },
                { label: "Fulfilled", value: data.awards_fulfilled },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-navy">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy mb-4">Funnel</h2>
            {funnel.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-500 w-32 shrink-0">{stage}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gold rounded-full h-2"
                    style={{ width: `${(count / maxFunnel) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-navy w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { adminFetch } from "@/lib/admin-fetch";
import type { AdminOutreach } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  responded: "bg-green-100 text-green-700",
  clicked: "bg-blue-100 text-blue-700",
  opened: "bg-yellow-100 text-yellow-700",
  sent: "bg-gray-100 text-gray-600",
  bounced: "bg-red-100 text-red-600",
  unsubscribed: "bg-red-50 text-red-400",
  pending: "bg-orange-50 text-orange-600",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default async function OutreachPage() {
  let records: AdminOutreach[] = [];
  let error: string | null = null;
  try {
    records = await adminFetch<AdminOutreach[]>("/outreach");
  } catch (e) {
    error = String(e);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Outreach</h1>
        <span className="text-sm text-gray-500">{records.length} emails</span>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">Step</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Sent</th>
              <th className="text-left px-4 py-3">Opened</th>
              <th className="text-left px-4 py-3">Clicked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.length === 0 && !error && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No outreach emails yet.</td></tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{r.business_name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.email_address}</td>
                <td className="px-4 py-3 text-center text-gray-600">{r.sequence_step}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{fmt(r.sent_at)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{fmt(r.opened_at)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{fmt(r.clicked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

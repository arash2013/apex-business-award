import { QUALIFIED_BUSINESSES } from "@/lib/seed-data";

const STUB_STATUS = ["sent", "opened", "clicked", "pending", "sent", "opened", "sent", "responded"] as const;

export default function OutreachPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Outreach</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">Email Step</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Sent At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {QUALIFIED_BUSINESSES.map((b, i) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">Step {(i % 3) + 1}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STUB_STATUS[i] === "responded"
                        ? "bg-green-100 text-green-700"
                        : STUB_STATUS[i] === "clicked"
                        ? "bg-blue-100 text-blue-700"
                        : STUB_STATUS[i] === "opened"
                        ? "bg-yellow-100 text-yellow-700"
                        : STUB_STATUS[i] === "sent"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {STUB_STATUS[i]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">2026-05-{String(i + 1).padStart(2, "0")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

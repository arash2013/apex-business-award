import { SEED_BUSINESSES } from "@/lib/seed-data";

const STAGES = [
  { name: "Discovered",    color: "bg-gray-100 text-gray-600" },
  { name: "Qualified",     color: "bg-blue-50 text-blue-700" },
  { name: "Outreach Sent", color: "bg-indigo-50 text-indigo-700" },
  { name: "Opened",        color: "bg-yellow-50 text-yellow-700" },
  { name: "Responded",     color: "bg-orange-50 text-orange-700" },
  { name: "Purchased",     color: "bg-green-50 text-green-700" },
  { name: "Fulfilled",     color: "bg-emerald-50 text-emerald-700" },
] as const;

const STAGE_MAP: Record<string, string> = {
  "biz-001": "Fulfilled",
  "biz-002": "Purchased",
  "biz-003": "Fulfilled",
  "biz-004": "Responded",
  "biz-005": "Outreach Sent",
  "biz-006": "Opened",
  "biz-007": "Qualified",
  "biz-008": "Purchased",
};

export default function PipelinePage() {
  const qualifiedBizs = SEED_BUSINESSES.filter((b) => b.qualified);
  const columns = STAGES.map((stage) => ({
    ...stage,
    items: qualifiedBizs.filter((b) => STAGE_MAP[b.id] === stage.name),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Pipeline</h1>
        <span className="text-sm text-gray-400">{qualifiedBizs.length} qualified businesses</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {columns.map(({ name, color, items }) => (
          <div key={name} className="min-w-[190px] w-48 flex-shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
                {name}
              </span>
              {items.length > 0 && (
                <span className="text-xs text-gray-300 font-medium tabular-nums">{items.length}</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {items.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="font-semibold text-navy text-xs leading-tight mb-1 truncate">{b.name}</p>
                  <p className="text-gray-400 text-[10px] mb-2">{b.category} · {b.neighborhood}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gold text-xs font-bold">{b.googleRating.toFixed(1)} ★</span>
                    {b.tier && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          b.tier === "premium"
                            ? "bg-navy text-gold"
                            : b.tier === "pro"
                            ? "bg-gold-50 text-gold-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {b.tier}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="h-16 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-200">—</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

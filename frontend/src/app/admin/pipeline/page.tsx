import { SEED_BUSINESSES } from "@/lib/seed-data";

const STAGES = [
  "Discovered",
  "Qualified",
  "Outreach Sent",
  "Opened",
  "Responded",
  "Purchased",
  "Fulfilled",
] as const;

// Stub distribution for demo
const STAGE_MAP: Record<string, (typeof STAGES)[number]> = {
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
  const columns = STAGES.map((stage) => ({
    stage,
    items: SEED_BUSINESSES.filter(
      (b) => STAGE_MAP[b.id] === stage && b.qualified
    ),
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(({ stage, items }) => (
          <div key={stage} className="min-w-[200px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {stage}
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm text-sm"
                >
                  <p className="font-medium text-navy truncate">{b.name}</p>
                  <p className="text-gray-400 text-xs">{b.category}</p>
                  <p className="text-gold text-xs mt-1">
                    {b.googleRating.toFixed(1)} ★
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

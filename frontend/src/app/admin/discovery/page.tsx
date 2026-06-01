import { brand } from "@/config/brand";

export default function DiscoveryPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-navy mb-2">Discovery</h1>
      <p className="text-gray-500 text-sm mb-8">
        Trigger a crawl to discover new businesses in a city + category.
      </p>

      <form className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-navy mb-1">City</label>
            <input
              defaultValue={brand.city}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy mb-1">State</label>
            <input
              defaultValue={brand.state}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-navy mb-1">Category</label>
          <input
            placeholder="e.g. HVAC, Dentist, Restaurant"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy mb-1">Radius (miles)</label>
          <input
            type="number"
            defaultValue={25}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="btn-primary">
          Start Crawl
        </button>
      </form>
    </div>
  );
}

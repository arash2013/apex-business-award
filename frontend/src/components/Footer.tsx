import { brand } from "@/config/brand";

export function Footer() {
  return (
    <footer className="bg-navy text-white/70 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p>
          &copy; {brand.year} {brand.name}. All rights reserved.
        </p>
        <p className="mt-1">{brand.tagline}</p>
      </div>
    </footer>
  );
}

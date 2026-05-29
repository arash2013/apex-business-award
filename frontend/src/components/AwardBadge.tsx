import { brand } from "@/config/brand";
import { clsx } from "clsx";

interface AwardBadgeProps {
  category: string;
  year?: number;
  size?: "sm" | "md" | "lg";
}

export function AwardBadge({
  category,
  year = brand.year,
  size = "md",
}: AwardBadgeProps) {
  return (
    <div
      className={clsx(
        "inline-flex flex-col items-center justify-center rounded-full border-4 border-gold bg-navy text-white font-bold",
        {
          "w-20 h-20 text-xs": size === "sm",
          "w-32 h-32 text-sm": size === "md",
          "w-48 h-48 text-base": size === "lg",
        }
      )}
      style={{ borderColor: brand.colors.accent }}
    >
      <span className="text-gold text-[0.6em] uppercase tracking-widest">
        {brand.short}
      </span>
      <span className="text-[0.7em] uppercase tracking-wide text-center px-2 leading-tight">
        {category}
      </span>
      <span className="text-gold text-[0.6em]">{year}</span>
    </div>
  );
}

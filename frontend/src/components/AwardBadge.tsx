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
  const s = {
    sm:  { outer: "w-16 h-16",  brandTxt: "text-[7px]",  star: "text-[10px]", cat: "text-[7px]",  yr: "text-[7px]",  border: 3 },
    md:  { outer: "w-28 h-28",  brandTxt: "text-[9px]",  star: "text-base",   cat: "text-[10px]", yr: "text-[9px]",  border: 4 },
    lg:  { outer: "w-44 h-44",  brandTxt: "text-xs",     star: "text-2xl",    cat: "text-sm",     yr: "text-xs",     border: 6 },
  }[size];

  return (
    <div
      className={clsx(
        "inline-flex flex-col items-center justify-center rounded-full bg-navy text-white shrink-0",
        s.outer
      )}
      style={{
        border: `${s.border}px solid ${brand.colors.accent}`,
        boxShadow: `0 0 0 2px ${brand.colors.accent}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <span className={clsx("text-gold uppercase tracking-widest font-bold leading-none", s.brandTxt)}>
        {brand.short}
      </span>
      <span className={clsx("text-gold leading-none my-0.5", s.star)}>★</span>
      <span className={clsx("uppercase tracking-wide text-center leading-tight px-2 font-semibold", s.cat)}>
        {category}
      </span>
      <span className={clsx("text-gold/70 leading-none mt-0.5", s.yr)}>{year}</span>
    </div>
  );
}

import { brand } from "@/config/brand";
import { clsx } from "clsx";

interface AwardBadgeProps {
  category: string;
  year?: number;
  size?: "sm" | "md" | "lg";
}

const GOLD = "#C9A84C";
const GOLD_DIM = "#C9A84C99";
const NAVY = "#1B2B4B";

function LaurelLeft({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={16 * scale}
      height={22 * scale}
      viewBox="0 0 16 22"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 2 C8 4, 4 8, 4 11 C4 14, 6 17, 10 19" stroke={GOLD_DIM} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="5" cy="5" rx="3" ry="1.5" transform="rotate(-30 5 5)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="4" cy="9" rx="3" ry="1.5" transform="rotate(-20 4 9)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="5" cy="13" rx="3" ry="1.5" transform="rotate(-10 5 13)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="8" cy="17" rx="3" ry="1.5" transform="rotate(5 8 17)" fill={GOLD_DIM} opacity="0.7" />
    </svg>
  );
}

function LaurelRight({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={16 * scale}
      height={22 * scale}
      viewBox="0 0 16 22"
      fill="none"
      aria-hidden="true"
      style={{ transform: "scaleX(-1)" }}
    >
      <path d="M12 2 C8 4, 4 8, 4 11 C4 14, 6 17, 10 19" stroke={GOLD_DIM} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="5" cy="5" rx="3" ry="1.5" transform="rotate(-30 5 5)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="4" cy="9" rx="3" ry="1.5" transform="rotate(-20 4 9)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="5" cy="13" rx="3" ry="1.5" transform="rotate(-10 5 13)" fill={GOLD_DIM} opacity="0.7" />
      <ellipse cx="8" cy="17" rx="3" ry="1.5" transform="rotate(5 8 17)" fill={GOLD_DIM} opacity="0.7" />
    </svg>
  );
}

export function AwardBadge({
  category,
  year = brand.year,
  size = "md",
}: AwardBadgeProps) {
  const s = {
    sm: {
      outer: "w-16 h-16",
      brandTxt: "text-[6px]",
      star: "text-[9px]",
      cat: "text-[6px]",
      yr: "text-[6px]",
      border: 2,
      laurel: false,
    },
    md: {
      outer: "w-28 h-28",
      brandTxt: "text-[8px]",
      star: "text-sm",
      cat: "text-[9px]",
      yr: "text-[8px]",
      border: 3,
      laurel: true,
      laurelScale: 0.7,
    },
    lg: {
      outer: "w-44 h-44",
      brandTxt: "text-[11px]",
      star: "text-xl",
      cat: "text-xs",
      yr: "text-[10px]",
      border: 5,
      laurel: true,
      laurelScale: 1.1,
    },
  }[size];

  return (
    <div
      className={clsx(
        "inline-flex flex-col items-center justify-center rounded-full bg-navy text-white shrink-0 relative overflow-hidden",
        s.outer
      )}
      style={{
        border: `${s.border}px solid ${GOLD}`,
        boxShadow: `0 0 0 1px ${GOLD}33, 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)`,
        background: `radial-gradient(ellipse at 50% 20%, #243660 0%, ${NAVY} 70%)`,
      }}
    >
      {/* Inner ring */}
      <div
        className="absolute inset-[4px] rounded-full pointer-events-none"
        style={{ border: `1px solid ${GOLD}22` }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center gap-0 px-2 text-center w-full">
        <span className={clsx("text-gold uppercase tracking-ultra font-bold leading-none", s.brandTxt)}>
          {brand.short}
        </span>

        {/* Laurel + star row */}
        {"laurel" in s && s.laurel ? (
          <div className="flex items-center justify-center gap-0.5 my-0.5">
            <LaurelLeft scale={"laurelScale" in s ? s.laurelScale : 1} />
            <span className={clsx("text-gold leading-none", s.star)}>★</span>
            <LaurelRight scale={"laurelScale" in s ? s.laurelScale : 1} />
          </div>
        ) : (
          <span className={clsx("text-gold leading-none my-0.5", s.star)}>★</span>
        )}

        <span
          className={clsx(
            "uppercase tracking-wide text-center leading-tight px-1 font-semibold text-white/90",
            s.cat
          )}
        >
          {category}
        </span>
        <span className={clsx("leading-none mt-0.5", s.yr)} style={{ color: `${GOLD}99` }}>
          {year}
        </span>
      </div>
    </div>
  );
}

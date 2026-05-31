export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Apex Business Award",
  short: process.env.NEXT_PUBLIC_BRAND_SHORT ?? "Apex",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ??
    "Recognizing Excellence in Local Business",
  city: process.env.NEXT_PUBLIC_BRAND_CITY ?? "Houston",
  state: "TX",
  year: parseInt(process.env.NEXT_PUBLIC_BRAND_YEAR ?? "2026"),
  colors: {
    primary: process.env.NEXT_PUBLIC_BRAND_COLOR_PRIMARY ?? "#1B2B4B",
    accent: process.env.NEXT_PUBLIC_BRAND_COLOR_ACCENT ?? "#C9A84C",
    background: "#FAFAF8",
  },
  domain: "apexbusinessaward.com",
  pricing: {
    basic: 199,
    pro: 249,
    premium: 349,
  },
} as const;

export type Brand = typeof brand;

export function awardName(
  category: string,
  year: number,
  neighborhood: string
): string {
  return `${brand.name} · ${category} · ${year} · ${neighborhood}`;
}

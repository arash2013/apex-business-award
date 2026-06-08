import { brand, awardName } from "@/config/brand";

describe("brand config", () => {
  it("has required string fields", () => {
    expect(typeof brand.name).toBe("string");
    expect(brand.name.length).toBeGreaterThan(0);
    expect(typeof brand.city).toBe("string");
    expect(typeof brand.state).toBe("string");
    expect(typeof brand.tagline).toBe("string");
  });

  it("has year 2026", () => {
    expect(brand.year).toBe(2026);
  });

  it("has pricing object with three tiers", () => {
    expect(brand.pricing).toBeDefined();
    expect(typeof brand.pricing.basic).toBe("number");
    expect(typeof brand.pricing.pro).toBe("number");
    expect(typeof brand.pricing.premium).toBe("number");
  });

  it("pricing values are positive", () => {
    expect(brand.pricing.basic).toBeGreaterThan(0);
    expect(brand.pricing.pro).toBeGreaterThan(0);
    expect(brand.pricing.premium).toBeGreaterThan(0);
  });

  it("premium price is higher than pro which is higher than basic", () => {
    expect(brand.pricing.basic).toBeLessThan(brand.pricing.pro);
    expect(brand.pricing.pro).toBeLessThan(brand.pricing.premium);
  });

  it("has primary and accent color values as hex", () => {
    expect(brand.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(brand.colors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("launch city is Houston", () => {
    expect(brand.city).toBe("Houston");
    expect(brand.state).toBe("TX");
  });
});

describe("awardName()", () => {
  it("includes category, year, and neighborhood", () => {
    const result = awardName("Restaurants", 2026, "Midtown");
    expect(result).toContain("Restaurants");
    expect(result).toContain("2026");
    expect(result).toContain("Midtown");
  });

  it("includes the brand name", () => {
    const result = awardName("Restaurants", 2026, "Midtown");
    expect(result).toContain(brand.name);
  });
});

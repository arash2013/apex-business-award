import { SEED_BUSINESSES, QUALIFIED_BUSINESSES } from "@/lib/seed-data";

describe("SEED_BUSINESSES integrity", () => {
  it("has at least one business", () => {
    expect(SEED_BUSINESSES.length).toBeGreaterThan(0);
  });

  it("every business has required fields", () => {
    for (const b of SEED_BUSINESSES) {
      expect(typeof b.id).toBe("string");
      expect(typeof b.name).toBe("string");
      expect(typeof b.slug).toBe("string");
      expect(typeof b.category).toBe("string");
      expect(typeof b.neighborhood).toBe("string");
      expect(typeof b.googleRating).toBe("number");
      expect(typeof b.googleReviewCount).toBe("number");
    }
  });

  it("unqualified businesses have score 0.0", () => {
    const unqualified = SEED_BUSINESSES.filter((b) => !b.qualified);
    for (const b of unqualified) {
      expect(b.qualificationScore).toBe(0.0);
    }
  });

  it("unqualified businesses have no tier", () => {
    const unqualified = SEED_BUSINESSES.filter((b) => !b.qualified);
    for (const b of unqualified) {
      expect(b.tier).toBeUndefined();
    }
  });

  it("qualified businesses meet hard cutoffs", () => {
    const qualified = SEED_BUSINESSES.filter((b) => b.qualified);
    for (const b of qualified) {
      expect(b.googleRating).toBeGreaterThanOrEqual(4.0);
      expect(b.googleReviewCount).toBeGreaterThanOrEqual(50);
    }
  });

  it("qualified businesses have a positive score", () => {
    const qualified = SEED_BUSINESSES.filter((b) => b.qualified);
    for (const b of qualified) {
      expect(b.qualificationScore).toBeGreaterThan(0);
    }
  });

  it("qualified businesses with a tier have valid tier values", () => {
    const tiered = SEED_BUSINESSES.filter((b) => b.qualified && b.tier !== undefined);
    for (const b of tiered) {
      expect(["basic", "pro", "premium"]).toContain(b.tier);
    }
  });

  it("all ids are unique", () => {
    const ids = SEED_BUSINESSES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all slugs are unique", () => {
    const slugs = SEED_BUSINESSES.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("QUALIFIED_BUSINESSES", () => {
  it("contains only qualified businesses", () => {
    for (const b of QUALIFIED_BUSINESSES) {
      expect(b.qualified).toBe(true);
    }
  });

  it("is a subset of SEED_BUSINESSES", () => {
    const allIds = new Set(SEED_BUSINESSES.map((b) => b.id));
    for (const b of QUALIFIED_BUSINESSES) {
      expect(allIds.has(b.id)).toBe(true);
    }
  });

  it("count matches filtered SEED_BUSINESSES", () => {
    const expected = SEED_BUSINESSES.filter((b) => b.qualified).length;
    expect(QUALIFIED_BUSINESSES.length).toBe(expected);
  });
});

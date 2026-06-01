import { render, screen } from "@testing-library/react";
import { AwardBadge } from "@/components/AwardBadge";
import { brand } from "@/config/brand";

describe("AwardBadge", () => {
  it("renders the brand short name", () => {
    render(<AwardBadge category="Restaurants" />);
    expect(screen.getByText(brand.short)).toBeInTheDocument();
  });

  it("renders the category", () => {
    render(<AwardBadge category="Restaurants" />);
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
  });

  it("renders the default brand year when no year prop", () => {
    render(<AwardBadge category="Restaurants" />);
    expect(screen.getByText(String(brand.year))).toBeInTheDocument();
  });

  it("renders a custom year when provided", () => {
    render(<AwardBadge category="Restaurants" year={2025} />);
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("renders all three sizes without crashing", () => {
    const { unmount, rerender } = render(<AwardBadge category="Cafes" size="sm" />);
    rerender(<AwardBadge category="Cafes" size="md" />);
    rerender(<AwardBadge category="Cafes" size="lg" />);
    expect(screen.getByText("Cafes")).toBeInTheDocument();
  });

  it("renders the star accent", () => {
    render(<AwardBadge category="Bakeries" />);
    expect(screen.getByText("★")).toBeInTheDocument();
  });
});

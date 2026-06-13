import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WinnersClient } from "@/app/(public)/winners/WinnersClient";
import type { SeedBusiness } from "@/lib/seed-data";

const BUSINESSES: SeedBusiness[] = [
  {
    id: "biz-001",
    slug: "rivers-edge-bistro",
    name: "River's Edge Bistro",
    category: "Restaurants",
    neighborhood: "Midtown",
    googleRating: 4.8,
    googleReviewCount: 312,
    yelpRating: 4.7,
    yelpReviewCount: 198,
    qualificationScore: 91.5,
    qualified: true,
    tier: "premium",
  },
  {
    id: "biz-002",
    slug: "peak-performance-gym",
    name: "Peak Performance Gym",
    category: "Fitness",
    neighborhood: "Heights",
    googleRating: 4.6,
    googleReviewCount: 187,
    yelpRating: 4.5,
    yelpReviewCount: 102,
    qualificationScore: 82.3,
    qualified: true,
    tier: "pro",
  },
  {
    id: "biz-003",
    slug: "zen-dental-studio",
    name: "Zen Dental Studio",
    category: "Dental",
    neighborhood: "Midtown",
    googleRating: 4.9,
    googleReviewCount: 203,
    yelpRating: 4.8,
    yelpReviewCount: 87,
    qualificationScore: 94.0,
    qualified: true,
    tier: "premium",
  },
];

describe("WinnersClient", () => {
  it("renders all businesses by default", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.getByText("River's Edge Bistro")).toBeInTheDocument();
    expect(screen.getByText("Peak Performance Gym")).toBeInTheDocument();
    expect(screen.getByText("Zen Dental Studio")).toBeInTheDocument();
  });

  it("shows total count in header description", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.getByText(/3 businesses recognized/)).toBeInTheDocument();
  });

  it("shows 'Showing all N winners' when no filters active", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.getByText(/Showing all 3 winners/)).toBeInTheDocument();
  });

  it("filters by search text (case-insensitive)", async () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const input = screen.getByPlaceholderText(/Search businesses/);
    await userEvent.type(input, "zen");
    expect(screen.getByText("Zen Dental Studio")).toBeInTheDocument();
    expect(screen.queryByText("River's Edge Bistro")).not.toBeInTheDocument();
    expect(screen.queryByText("Peak Performance Gym")).not.toBeInTheDocument();
  });

  it("filters by category", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const select = screen.getByDisplayValue("All Categories");
    fireEvent.change(select, { target: { value: "Fitness" } });
    expect(screen.getByText("Peak Performance Gym")).toBeInTheDocument();
    expect(screen.queryByText("River's Edge Bistro")).not.toBeInTheDocument();
  });

  it("filters by neighborhood", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const select = screen.getByDisplayValue("All Neighborhoods");
    fireEvent.change(select, { target: { value: "Midtown" } });
    expect(screen.getByText("River's Edge Bistro")).toBeInTheDocument();
    expect(screen.getByText("Zen Dental Studio")).toBeInTheDocument();
    expect(screen.queryByText("Peak Performance Gym")).not.toBeInTheDocument();
  });

  it("shows filtered count text when filter is active", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const select = screen.getByDisplayValue("All Categories");
    fireEvent.change(select, { target: { value: "Fitness" } });
    expect(screen.getByText(/1 of 3 winners/)).toBeInTheDocument();
  });

  it("shows empty state when no results match", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const input = screen.getByPlaceholderText(/Search businesses/);
    fireEvent.change(input, { target: { value: "zzznomatch" } });
    expect(screen.getByText(/No winners match your filters/)).toBeInTheDocument();
  });

  it("shows 'Clear filters' button when filters are active", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const select = screen.getByDisplayValue("All Categories");
    fireEvent.change(select, { target: { value: "Fitness" } });
    expect(screen.getByRole("button", { name: /Clear filters/ })).toBeInTheDocument();
  });

  it("does not show 'Clear filters' button when no filters active", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.queryByRole("button", { name: /Clear filters/ })).not.toBeInTheDocument();
  });

  it("clear filters button restores all results", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const select = screen.getByDisplayValue("All Categories");
    fireEvent.change(select, { target: { value: "Fitness" } });
    expect(screen.queryByText("River's Edge Bistro")).not.toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /Clear filters/ });
    fireEvent.click(clearBtn);
    expect(screen.getByText("River's Edge Bistro")).toBeInTheDocument();
    expect(screen.getByText("Peak Performance Gym")).toBeInTheDocument();
    expect(screen.getByText("Zen Dental Studio")).toBeInTheDocument();
  });

  it("renders category options from businesses data", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.getByRole("option", { name: "Restaurants" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fitness" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dental" })).toBeInTheDocument();
  });

  it("renders neighborhood options from businesses data", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    expect(screen.getByRole("option", { name: "Midtown" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Heights" })).toBeInTheDocument();
  });

  it("handles empty businesses list gracefully", () => {
    render(<WinnersClient businesses={[]} />);
    expect(screen.getByText(/0 businesses recognized/)).toBeInTheDocument();
  });

  it("clears search via empty state 'Clear all filters' button", () => {
    render(<WinnersClient businesses={BUSINESSES} />);
    const input = screen.getByPlaceholderText(/Search businesses/);
    fireEvent.change(input, { target: { value: "zzznomatch" } });
    const clearBtn = screen.getByRole("button", { name: /Clear all filters/ });
    fireEvent.click(clearBtn);
    expect(screen.getByText("River's Edge Bistro")).toBeInTheDocument();
  });
});

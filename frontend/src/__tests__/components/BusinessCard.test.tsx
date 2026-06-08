import { render, screen } from "@testing-library/react";
import { BusinessCard } from "@/components/BusinessCard";

const BASE_PROPS = {
  slug: "test-bistro",
  name: "Test Bistro",
  category: "Restaurants",
  neighborhood: "Midtown",
  googleRating: 4.7,
  googleReviewCount: 250,
};

describe("BusinessCard", () => {
  it("renders business name", () => {
    render(<BusinessCard {...BASE_PROPS} />);
    expect(screen.getByText("Test Bistro")).toBeInTheDocument();
  });

  it("renders category and neighborhood in the subtitle line", () => {
    render(<BusinessCard {...BASE_PROPS} />);
    // The "Category · Neighborhood" line is rendered as a single <p> element
    expect(screen.getByText(/Restaurants · Midtown/)).toBeInTheDocument();
  });

  it("renders google rating formatted to 1 decimal", () => {
    render(<BusinessCard {...BASE_PROPS} googleRating={4.7} />);
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("renders review count", () => {
    render(<BusinessCard {...BASE_PROPS} googleReviewCount={250} />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it("renders tier badge when tier is provided", () => {
    render(<BusinessCard {...BASE_PROPS} tier="pro" />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("does not render tier badge when tier is undefined", () => {
    render(<BusinessCard {...BASE_PROPS} />);
    expect(screen.queryByText("Pro")).not.toBeInTheDocument();
    expect(screen.queryByText("Premium")).not.toBeInTheDocument();
    expect(screen.queryByText("Basic")).not.toBeInTheDocument();
  });

  it("renders 'View profile' hint for pro tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="pro" />);
    expect(screen.getByText(/View profile/)).toBeInTheDocument();
  });

  it("renders 'View profile' hint for premium tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="premium" />);
    expect(screen.getByText(/View profile/)).toBeInTheDocument();
  });

  it("does not render 'View profile' hint for basic tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="basic" />);
    expect(screen.queryByText(/View profile/)).not.toBeInTheDocument();
  });

  it("does not render 'View profile' hint when no tier", () => {
    render(<BusinessCard {...BASE_PROPS} />);
    expect(screen.queryByText(/View profile/)).not.toBeInTheDocument();
  });

  it("wraps card in a Link for pro tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="pro" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/winners/test-bistro");
  });

  it("wraps card in a Link for premium tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="premium" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/winners/test-bistro");
  });

  it("does not render a link for basic tier", () => {
    render(<BusinessCard {...BASE_PROPS} tier="basic" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render a link when no tier", () => {
    render(<BusinessCard {...BASE_PROPS} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders Premium badge text", () => {
    render(<BusinessCard {...BASE_PROPS} tier="premium" />);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders Basic badge text", () => {
    render(<BusinessCard {...BASE_PROPS} tier="basic" />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
  });
});

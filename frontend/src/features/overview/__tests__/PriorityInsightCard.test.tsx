import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityInsightCard } from "../PriorityInsightCard";
import { insightDummy } from "@/dummy/insightDummy";

vi.mock("@phosphor-icons/react", () => ({
  Warning: (props: any) => <span data-testid="warning-icon" {...props} />,
  Train: (props: any) => <span data-testid="train-icon" {...props} />,
  Target: (props: any) => <span data-testid="target-icon" {...props} />,
  Heartbeat: (props: any) => <span data-testid="heartbeat-icon" {...props} />,
}));

const insight = insightDummy[0]; // INS-001, Car 5, High, confidence 86, healthScore 42

describe("PriorityInsightCard", () => {
  it("renders the insight diagnosis containing 'Car 5'", () => {
    render(<PriorityInsightCard insight={insight} />);
    expect(screen.getAllByText(/Car 5/)[0]).toBeInTheDocument();
  });

  it("shows the compact risk title and severity badge", () => {
    render(<PriorityInsightCard insight={insight} />);

    expect(screen.getByRole("heading", { name: /c5 brake system - risiko tinggi/i })).toBeInTheDocument();
    expect(screen.getByText("Tinggi")).toBeInTheDocument();
  });

  it("shows the recommendation preview", () => {
    render(<PriorityInsightCard insight={insight} />);

    expect(screen.getByText(insight.recommendation)).toBeInTheDocument();
  });

  it("shows Warning icon when severity is High", () => {
    render(<PriorityInsightCard insight={insight} />);
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("routes action links to their target pages", () => {
    render(<PriorityInsightCard insight={insight} />);

    expect(screen.getByRole("link", { name: /lihat insight/i })).toHaveAttribute("href", "/insight-analytic");
    expect(screen.getByRole("link", { name: /tinjau bukti/i })).toHaveAttribute(
      "href",
      "/car-detail?trainset=TS-001&car=5&subsystem=Brake+System"
    );
    expect(screen.getByRole("link", { name: /buat spk/i })).toHaveAttribute("href", "/work-order");
  });
});

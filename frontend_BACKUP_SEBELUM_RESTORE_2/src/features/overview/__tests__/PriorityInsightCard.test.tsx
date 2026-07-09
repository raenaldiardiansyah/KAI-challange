import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows confidence '86%' and healthScore '42%'", () => {
    render(<PriorityInsightCard insight={insight} />);
    expect(screen.getByText("86%")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("shows the trainset and car info in a bubble chip", () => {
    render(<PriorityInsightCard insight={insight} />);
    expect(
      screen.getAllByText((_content, el) => {
        return el?.textContent?.includes("C5") ?? false;
      })[0]
    ).toBeInTheDocument();
  });

  it("shows Warning icon when severity is High", () => {
    render(<PriorityInsightCard insight={insight} />);
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("button 'Tinjau Bukti' calls router.push with /car-detail?car=5", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;

    render(<PriorityInsightCard insight={insight} />);
    const button = screen.getByRole("button", { name: /Tinjau Bukti/i });
    await user.click(button);

    expect(pushMock).toHaveBeenCalledWith("/car-detail?car=5");
  });
});

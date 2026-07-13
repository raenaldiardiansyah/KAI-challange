import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrainComposition } from "../TrainComposition";
import type { Insight } from "@/types/insight";

const insight: Insight = {
  id: "INS-001",
  trainsetId: "TS-001",
  trainsetName: "Anggrek Lembah",
  carNumber: 5,
  subsystem: "Brake System",
  event: "Brake anomaly",
  severity: "High",
  confidence: 86,
  healthScore: 42,
  diagnosis: "Brake pressure deviation",
  risk: "High",
  evidence: {},
  structuredInsight: {},
  naturalInsight: "Brake pressure deviation",
  recommendation: "Inspect brake system"
};

describe("TrainComposition", () => {
  it("uses the composition only as a local insight selector", () => {
    const onSelectCar = vi.fn();

    render(
      <TrainComposition
        totalCars={10}
        selectedCar={5}
        carsInsights={[insight]}
        onSelectCar={onSelectCar}
      />
    );

    expect(screen.queryByRole("link", { name: /C5, Status Critical/i })).not.toBeInTheDocument();

    const carButton = screen.getByRole("button", { name: /C5, Status Critical/i });
    expect(carButton).toHaveAttribute("aria-pressed", "true");
    carButton.click();

    expect(onSelectCar).toHaveBeenCalledWith(5);
  });
});

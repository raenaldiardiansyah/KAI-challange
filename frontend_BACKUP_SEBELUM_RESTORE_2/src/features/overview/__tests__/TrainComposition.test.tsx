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
  it("uses overview composition as a local summary selector", () => {
    const onSelectCar = vi.fn();

    render(
      <TrainComposition
        totalCars={10}
        selectedCar={5}
        carsInsights={[insight]}
        onSelectCar={onSelectCar}
      />
    );

    expect(screen.queryByRole("link", { name: "C5" })).not.toBeInTheDocument();

    screen.getByRole("button", { name: "C5" }).click();

    expect(onSelectCar).toHaveBeenCalledWith(5);
  });
});

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
  it("links each car to the explicit car detail route", () => {
    render(
      <TrainComposition
        totalCars={10}
        selectedCar={5}
        carsInsights={[insight]}
        onSelectCar={vi.fn()}
      />
    );

    expect(screen.getByRole("link", { name: "C5" })).toHaveAttribute(
      "href",
      "/car-detail?trainset=TS-001&car=5&subsystem=Brake+System"
    );
    expect(screen.getByRole("link", { name: "C1" })).toHaveAttribute(
      "href",
      "/car-detail?trainset=TS-001&car=1"
    );
  });
});

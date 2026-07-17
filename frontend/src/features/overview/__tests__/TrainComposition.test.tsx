import { describe, expect, it } from "vitest";
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
  recommendation: "Inspect brake system",
  carId: "M102401"
};

describe("TrainComposition", () => {
  it("selects the authentic backend car and hides the C-number label", () => {
    const { container } = render(
      <TrainComposition
        trainsetId="KA_DATA_DUMMY"
        totalCars={10}
        cars={[{ carId: "M102401", carNumber: 5 }]}
        selectedCar={5}
        carsInsights={[insight]}
        onSelectCar={() => undefined}
      />
    );

    const carButton = screen.getByRole("button", { name: /Gerbong M102401, Status Critical/i });
    expect(carButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("C5")).not.toBeInTheDocument();
    expect(container.querySelector(".train-car-alert")).toHaveAttribute("transform", "translate(32 17)");
    expect(screen.queryByRole("link", { name: /Gerbong M102401/i })).not.toBeInTheDocument();
  });

  it("renders the actual cars array instead of the reported total", () => {
    const cars = [
      { carId: "M102401", carNumber: 1 },
      { carId: "M102402", carNumber: 2 },
      { carId: "T102401", carNumber: 3 },
      { carId: "D102404", carNumber: 4 },
      { carId: "D102405", carNumber: 5 }
    ];

    render(
      <TrainComposition
        trainsetId="KA_DATA_DUMMY"
        totalCars={10}
        cars={cars}
        selectedCar={1}
        carsInsights={[]}
        onSelectCar={() => undefined}
      />
    );

    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: /Gerbong D102405/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gerbong D102406/i })).not.toBeInTheDocument();
  });
});

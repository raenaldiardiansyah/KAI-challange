import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrainsetComposition } from "../TrainsetComposition";
import type { Insight } from "@/types/insight";

const insight: Insight = {
  id: "INS-002",
  trainsetId: "TS-002",
  trainsetName: "Argo Wilis",
  carNumber: 3,
  subsystem: "HVAC",
  event: "Temperature anomaly",
  severity: "Medium",
  confidence: 74,
  healthScore: 63,
  diagnosis: "Cabin temperature deviation",
  risk: "Medium",
  evidence: {},
  structuredInsight: {},
  naturalInsight: "Cabin temperature deviation",
  recommendation: "Check HVAC controller"
};

describe("TrainsetComposition", () => {
  it("routes cars to the selected trainset and car number explicitly", () => {
    render(
      <TrainsetComposition
        trainsetId="TS-002"
        totalCars={5}
        carsInsights={[insight]}
      />
    );

    expect(screen.getByRole("link", { name: "C3" })).toHaveAttribute(
      "href",
      "/car-detail?trainset=TS-002&car=3&subsystem=HVAC"
    );
    expect(screen.getByRole("link", { name: "C5" })).toHaveAttribute(
      "href",
      "/car-detail?trainset=TS-002&car=5"
    );
  });
});

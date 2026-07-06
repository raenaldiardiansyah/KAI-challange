import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubsystemHeatmap } from "../SubsystemHeatmap";

describe("SubsystemHeatmap", () => {
  it("routes a clicked subsystem cell to the explicit trainset, car, and subsystem", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;

    render(
      <SubsystemHeatmap
        trainsetId="TS-001"
        trainsetName="Anggrek Lembah"
        totalCars={5}
        carsInsights={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: /C5 - Brake System/i }));

    expect(pushMock).toHaveBeenCalledWith("/car-detail?trainset=TS-001&car=5&subsystem=Brake+System");
  });

  it("supports keyboard navigation for subsystem cells", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;

    render(
      <SubsystemHeatmap
        trainsetId="TS-002"
        trainsetName="Argo Wilis"
        totalCars={3}
        carsInsights={[]}
      />
    );

    const hvacC3 = screen.getByRole("button", { name: /C3 - HVAC/i });
    hvacC3.focus();
    await user.keyboard("{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/car-detail?trainset=TS-002&car=3&subsystem=HVAC");
  });
});

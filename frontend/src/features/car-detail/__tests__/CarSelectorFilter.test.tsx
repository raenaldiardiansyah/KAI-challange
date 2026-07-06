import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarSelectorFilter } from "../CarSelectorFilter";

describe("CarSelectorFilter", () => {
  it("keeps the selected trainset and car when applying a subsystem filter", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;

    render(
      <CarSelectorFilter
        defaultTrainset="TS-001"
        defaultCar="5"
        defaultSubsystem="all"
        trainsets={[{ id: "TS-001", name: "Anggrek Lembah" }]}
        totalCarsByTrainset={{ "TS-001": 10 }}
        availableSubsystems={["Brake System", "Door", "HVAC"]}
      />
    );

    await user.selectOptions(screen.getByLabelText("Subsistem"), "Brake System");

    expect(pushMock).toHaveBeenCalledWith("?trainset=TS-001&car=5&subsystem=Brake+System");
  });

  it("removes subsystem from the URL when selecting all subsystems", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;

    render(
      <CarSelectorFilter
        defaultTrainset="TS-001"
        defaultCar="5"
        defaultSubsystem="Brake System"
        trainsets={[{ id: "TS-001", name: "Anggrek Lembah" }]}
        totalCarsByTrainset={{ "TS-001": 10 }}
        availableSubsystems={["Brake System", "Door", "HVAC"]}
      />
    );

    await user.selectOptions(screen.getByLabelText("Subsistem"), "all");

    expect(pushMock).toHaveBeenCalledWith("?trainset=TS-001&car=5");
  });
});

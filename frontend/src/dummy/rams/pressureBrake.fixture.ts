import type { RamsPressureBrakeResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const pressureBrakeFixture: RamsPressureBrakeResponse = {
  ok: true,
  generated_at: RAMS_FIXTURE_GENERATED_AT,
  filters: { trainset: null, car: null },
  items: fixtureTrains.map((train) => ({
    trainset: train.trainset_id,
    cars: train.cars.map((car) => {
      const pressure = car.subsystems.find((subsystem) => subsystem.subsystem === "PRESSURE");
      return {
        car: car.car_id,
        bp: typeof pressure?.latest_values.brake_pipe === "number" ? pressure.latest_values.brake_pipe : null,
        bc: typeof pressure?.latest_values.brake_cylinder === "number" ? pressure.latest_values.brake_cylinder : null
      };
    })
  }))
};

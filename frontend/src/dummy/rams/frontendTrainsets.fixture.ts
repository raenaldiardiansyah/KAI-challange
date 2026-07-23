import type { RamsFrontendTrainsetsResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const frontendTrainsetsFixture: RamsFrontendTrainsetsResponse = {
  ok: true,
  generated_at: RAMS_FIXTURE_GENERATED_AT,
  total: fixtureTrains.length,
  limit: 1000,
  offset: 0,
  items: fixtureTrains.map((train) => ({
    trainset: train.trainset_id,
    cars_connected: train.cars.filter((car) => car.status !== "OFFLINE").map((car) => car.car_id)
  }))
};

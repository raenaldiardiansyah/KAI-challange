import type { RamsMapsResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const frontendMapsFixture: RamsMapsResponse = {
  ok: true,
  generated_at: RAMS_FIXTURE_GENERATED_AT,
  items: fixtureTrains.map((train) => ({
    trainset: train.trainset_id,
    lat: train.position?.latitude ?? null,
    long: train.position?.longitude ?? null,
    speed: train.position?.speed_kph ?? null
  }))
};

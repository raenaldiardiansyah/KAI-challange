import type { RamsCarDetailResponse, RamsTrainsetListResponse, RamsTrainsetResponse } from "@/types/api";
import { fixtureTrains } from "./shared.fixture";

export const trainsetsFixture: RamsTrainsetListResponse = { ok: true, trains: fixtureTrains };

export function trainsetFixture(trainsetId: string): RamsTrainsetResponse {
  const train = fixtureTrains.find((item) => item.trainset_id === trainsetId) ?? fixtureTrains[0];
  return { ok: true, train };
}

export function carDetailFixture(trainsetId: string, carId: string): RamsCarDetailResponse {
  const train = fixtureTrains.find((item) => item.trainset_id === trainsetId) ?? fixtureTrains[0];
  const car = train.cars.find((item) => item.car_id === carId) ?? train.cars[0];
  return { ok: true, car: { trainset_id: train.trainset_id, car_id: car.car_id, subsystems: car.subsystems } };
}

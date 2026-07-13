import type { RamsTrainsetHealthResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const trainsetHealthFixture: RamsTrainsetHealthResponse = {
  ok: true,
  filters: { trainset: null },
  count: fixtureTrains.length,
  items: fixtureTrains.map((train) => {
    const statuses = train.cars.map((car) => car.status);
    return {
      trainset_id: train.trainset_id,
      display_name: train.display_name,
      health_status: train.status,
      health_score: train.health_score,
      data_status: train.status === "OFFLINE" ? "OFFLINE" : "ONLINE",
      display_status: train.status,
      total_cars: train.total_cars,
      online_cars: train.online_cars,
      degraded_car_count: statuses.filter((status) => ["WARNING", "WATCH", "CRITICAL"].includes(status)).length,
      critical_car_count: statuses.filter((status) => status === "CRITICAL").length,
      warning_car_count: statuses.filter((status) => status === "WARNING").length,
      watch_car_count: statuses.filter((status) => status === "WATCH").length,
      offline_car_count: statuses.filter((status) => status === "OFFLINE").length,
      car_summary_json: train.cars.map((car) => ({
        car_id: car.car_id,
        health_status: car.status,
        health_score: car.health_score,
        data_status: car.status === "OFFLINE" ? "OFFLINE" : "ONLINE",
        display_status: car.status
      })),
      source: "car_health_aggregation",
      last_update: train.last_update,
      updated_at: RAMS_FIXTURE_GENERATED_AT
    };
  })
};

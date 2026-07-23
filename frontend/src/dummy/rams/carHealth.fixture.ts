import type { RamsCarHealthResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export function carHealthFixture(trainsetId?: string, carId?: string): RamsCarHealthResponse {
  const trains = trainsetId ? fixtureTrains.filter((train) => train.trainset_id === trainsetId) : fixtureTrains;
  const items = trains.flatMap((train) => train.cars
    .filter((car) => !carId || car.car_id === carId)
    .map((car) => {
      const statuses = car.subsystems.map((subsystem) => subsystem.status);
      return {
        trainset_id: train.trainset_id,
        car_id: car.car_id,
        health_status: car.status,
        health_score: car.health_score,
        data_status: car.status === "OFFLINE" ? "OFFLINE" : "ONLINE",
        display_status: car.status,
        degraded_subsystem_count: statuses.filter((status) => ["WARNING", "WATCH", "CRITICAL"].includes(status)).length,
        critical_subsystem_count: statuses.filter((status) => status === "CRITICAL").length,
        warning_subsystem_count: statuses.filter((status) => status === "WARNING").length,
        watch_subsystem_count: statuses.filter((status) => status === "WATCH").length,
        offline_subsystem_count: statuses.filter((status) => status === "OFFLINE").length,
        subsystem_summary_json: car.subsystems.map((subsystem) => ({
          subsystem_code: subsystem.subsystem,
          health_status: subsystem.status,
          health_score: subsystem.health_score,
          data_status: subsystem.status === "OFFLINE" ? "OFFLINE" : "ONLINE",
          display_status: subsystem.status,
          reason: subsystem.latest_values,
          last_update: subsystem.last_update
        })),
        source: "subsystem_health_aggregation",
        last_update: car.last_update,
        updated_at: RAMS_FIXTURE_GENERATED_AT
      };
    }));
  return { ok: true, filters: { trainset: trainsetId ?? null, car_id: carId ?? null }, count: items.length, items };
}

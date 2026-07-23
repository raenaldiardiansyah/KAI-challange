import type { RamsSubsystemHealthResponse } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export function subsystemHealthFixture(trainsetId?: string, carId?: string, subsystemCode?: string): RamsSubsystemHealthResponse {
  let id = 1;
  const items = fixtureTrains
    .filter((train) => !trainsetId || train.trainset_id === trainsetId)
    .flatMap((train) => train.cars
      .filter((car) => !carId || car.car_id === carId)
      .flatMap((car) => car.subsystems
        .filter((subsystem) => !subsystemCode || subsystem.subsystem === subsystemCode)
        .map((subsystem) => ({
          id: id++,
          trainset_id: train.trainset_id,
          car_id: car.car_id,
          subsystem_code: subsystem.subsystem,
          health_status: subsystem.status,
          health_score: subsystem.health_score,
          data_status: subsystem.status === "OFFLINE" ? "OFFLINE" : "ONLINE",
          display_status: subsystem.status,
          primary_rule_id: subsystem.status === "ONLINE" ? null : `${subsystem.subsystem}-R001`,
          primary_event_code: subsystem.status === "ONLINE" ? null : `${subsystem.subsystem}_DEVIATION`,
          reason: subsystem.status === "ONLINE" ? "Parameter dalam rentang normal" : "Nilai sensor melewati rule demonstrasi",
          last_value_json: Object.fromEntries(Object.entries(subsystem.latest_values).map(([key, value]) => [key, { unit: key.includes("temperature") ? "C" : key.includes("humidity") ? "%" : "bar", label: key.replaceAll("_", " "), value }])),
          matched_rules_json: subsystem.status === "ONLINE" ? [] : [{ level: subsystem.status, rule_id: `${subsystem.subsystem}-R001`, event_code: `${subsystem.subsystem}_DEVIATION`, recommendation: "Lakukan inspeksi sesuai subsystem.", condition_expression: "fixture_value outside threshold" }],
          source: "official_rule_snapshot",
          last_update: subsystem.last_update,
          created_at: "2026-07-13T07:00:00.000Z",
          updated_at: RAMS_FIXTURE_GENERATED_AT
        }))));
  return { ok: true, filters: { trainset: trainsetId ?? null, car_id: carId ?? null, subsystem: subsystemCode ?? null }, count: items.length, items };
}

import type { RamsDatabaseHealthDto } from "@/types/api";

export const databaseHealthFixture: RamsDatabaseHealthDto = {
  ok: true,
  database: "railway_monitoring_v3_fixture",
  raw_mqtt_message: 1200,
  telemetry_signal: 5012,
  event_log: 45
};

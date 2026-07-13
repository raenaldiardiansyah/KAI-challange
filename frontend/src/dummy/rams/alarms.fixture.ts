import type { RamsAlarmDto, RamsAlarmsResponse } from "@/types/api";
import { RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const alarmRecordsFixture: RamsAlarmDto[] = [
  {
    id: 12,
    title: "Brake Cylinder Pressure High",
    description: "Brake cylinder pressure exceeds the documented threshold.",
    trainset_id: "KA_DATA_DUMMY",
    car_id: "M102401",
    subsystem: "PRESSURE",
    signal_name: "brake_cylinder",
    severity: "WARNING",
    status: "ACTIVE",
    observed_value: 1.1,
    threshold_value: 2.1,
    evidence: { observed_value: 1.1, threshold_value: 2.1, unit: "bar" },
    first_seen_at: "2026-07-13T08:10:00.000Z",
    last_seen_at: RAMS_FIXTURE_GENERATED_AT
  },
  {
    id: 13,
    title: "AC Temperature High",
    description: "Cabin temperature is above the comfort band.",
    trainset_id: "KA_DATA_DUMMY",
    car_id: "T102401",
    subsystem: "AC",
    signal_name: "actual_temperature",
    severity: "WARNING",
    status: "ACKED",
    observed_value: 28.4,
    threshold_value: 27,
    evidence: { actual_temperature: 28.4, actual_humidity: 64 },
    first_seen_at: "2026-07-13T07:55:00.000Z",
    last_seen_at: RAMS_FIXTURE_GENERATED_AT
  },
  {
    id: 14,
    title: "Brake Pipe Critical Low",
    description: "Brake pipe pressure is critically low.",
    trainset_id: "KA_DATA_DUMMY",
    car_id: "D102405",
    subsystem: "PRESSURE",
    signal_name: "brake_pipe",
    severity: "CRITICAL",
    status: "ACTIVE",
    observed_value: 3.6,
    threshold_value: 4.5,
    evidence: "{\"observed_value\":3.6,\"threshold_value\":4.5,\"unit\":\"bar\"}" as unknown as Record<string, unknown>,
    first_seen_at: "2026-07-13T08:20:00.000Z",
    last_seen_at: RAMS_FIXTURE_GENERATED_AT
  },
  {
    id: 15,
    title: "Historical Pressure Event",
    description: "Pressure event resolved after inspection.",
    trainset_id: "KA_DUMMY_DATA",
    car_id: "K102401",
    subsystem: "PRESSURE",
    signal_name: "brake_pipe",
    severity: "WATCH",
    status: "RESOLVED",
    observed_value: null,
    threshold_value: null,
    evidence: null,
    first_seen_at: "2026-07-12T10:00:00.000Z",
    last_seen_at: "2026-07-12T10:30:00.000Z"
  }
];

export function alarmsFixture(status?: string): RamsAlarmsResponse {
  return {
    ok: true,
    items: status ? alarmRecordsFixture.filter((alarm) => alarm.status === status) : alarmRecordsFixture
  };
}

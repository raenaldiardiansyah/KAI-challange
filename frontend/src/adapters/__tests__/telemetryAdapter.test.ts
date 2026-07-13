import { describe, expect, it } from "vitest";
import { adaptTelemetryRecord } from "../telemetryAdapter";
import type { RamsTelemetryDto } from "@/types/api";

const base: RamsTelemetryDto = {
  id: 1,
  event_time: "2026-07-13T08:10:00Z",
  trainset_id: "KA_DATA_DUMMY",
  car_id: "M102401",
  subsystem: "PRESSURE",
  signal_name: "brake_pipe",
  value: 0,
  value_float: 0,
  value_text: null,
  unit: "bar",
  quality_status: "GOOD",
  source_topic: "rams/topic"
};

describe("telemetry adapter", () => {
  it("preserves numeric zero and maps explicit identities", () => {
    expect(adaptTelemetryRecord(base)).toMatchObject({
      displayValue: "0", trainsetLabel: "TS-001", carLabel: "C1", valueFloat: 0
    });
  });

  it("uses text value and preserves an unknown backend car identity", () => {
    expect(adaptTelemetryRecord({ ...base, car_id: "BACKEND-CAR-X", value: "OPEN", value_float: null, value_text: "OPEN" }))
      .toMatchObject({ displayValue: "OPEN", carLabel: "BACKEND-CAR-X", carId: "BACKEND-CAR-X" });
  });

  it("does not invent a car when telemetry is train-level", () => {
    expect(adaptTelemetryRecord({ ...base, car_id: null })).toMatchObject({ carLabel: "Kereta", carId: null });
  });
});


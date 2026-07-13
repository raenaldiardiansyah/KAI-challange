import type { RamsPredictiveResponse } from "@/types/api";
import { RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const predictiveFixture: RamsPredictiveResponse = {
  ok: true,
  items: [
    {
      id: 1,
      trainset_id: "KA_DATA_DUMMY",
      car_id: "D102405",
      subsystem: "PRESSURE",
      prediction_type: "BREATHER_VALVE_FAIL",
      risk_score: 0.84,
      predicted_status: "HIGH_RISK",
      recommendation: "Jadwalkan inspeksi valve dan sensor pressure.",
      features: { bp_leak_rate: 0.12, mean_bc_pressure: 1.1 },
      created_at: RAMS_FIXTURE_GENERATED_AT
    },
    {
      id: 2,
      trainset_id: "KA_DATA_DUMMY",
      car_id: "T102401",
      subsystem: "AC",
      prediction_type: "COMPRESSOR_DEGRADATION",
      risk_score: 61,
      predicted_status: "MEDIUM_RISK",
      recommendation: "Pantau arus compressor dan temperatur kabin.",
      features: { temperature_mean: 28.4, humidity_mean: 64 },
      created_at: "2026-07-13T08:40:00.000Z"
    },
    {
      id: 3,
      trainset_id: "KA_DUMMY_DATA",
      car_id: null,
      subsystem: "PRESSURE",
      prediction_type: "INSUFFICIENT_DATA",
      risk_score: null,
      predicted_status: "UNKNOWN",
      recommendation: "Tunggu data telemetry yang cukup.",
      features: {},
      created_at: RAMS_FIXTURE_GENERATED_AT
    }
  ]
};

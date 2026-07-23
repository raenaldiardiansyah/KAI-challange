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
      trainset_id: "KA_TAKSAKA_DEMO",
      car_id: "TAKSAKA03",
      subsystem: "AC",
      prediction_type: "COMPRESSOR_CURRENT_DEVIATION",
      risk_score: 0.48,
      predicted_status: "MEDIUM_RISK",
      recommendation: "Jadwalkan pemeriksaan arus kompresor dan bersihkan filter AC.",
      features: { compressor_current_amp: 11.2, cabin_temperature_c: 28.1, humidity_percent: 66 },
      created_at: "2026-07-13T08:35:00.000Z"
    },
    {
      id: 4,
      trainset_id: "KA_DUMMY_DATA",
      car_id: "K102402",
      subsystem: "PRESSURE",
      prediction_type: "BRAKE_PRESSURE_DRIFT",
      risk_score: 0.34,
      predicted_status: "MEDIUM_RISK",
      recommendation: "Validasi sensor brake pipe dan bandingkan tekanan antar gerbong.",
      features: { brake_pipe_pressure_bar: 4.1, pressure_drift_percent: 7.4 },
      created_at: "2026-07-13T08:30:00.000Z"
    },
    {
      id: 5,
      trainset_id: "KA_GAJAYANA_DEMO",
      car_id: "GAJAYANA04",
      subsystem: "COMMUNICATION",
      prediction_type: "COMM_INTERMITTENT",
      risk_score: 0.22,
      predicted_status: "WATCH",
      recommendation: "Pantau jeda komunikasi controller dan cek konektor saat inspeksi rutin.",
      features: { packet_loss_percent: 2.8, reconnect_count: 4 },
      created_at: "2026-07-13T08:24:00.000Z"
    },
    {
      id: 6,
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

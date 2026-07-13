import type { RamsInsightsResponse } from "@/types/api";
import { RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const insightsFixture: RamsInsightsResponse = {
  ok: true,
  items: [
    {
      id: 1,
      source_event_id: 12,
      trainset_id: "KA_DATA_DUMMY",
      car_id: "M102401",
      subsystem: "PRESSURE",
      severity: "WARNING",
      title: "Brake Cylinder Pressure Deviation",
      summary: "Deviasi tekanan brake cylinder terdeteksi pada C1.",
      technical_explanation: "Brake cylinder 1.1 bar berada di bawah threshold 2.1 bar ketika brake pipe stabil.",
      probable_causes: ["Valve tersendat", "Sensor atau konektor tidak stabil"],
      recommended_actions: ["Periksa valve", "Validasi sensor BPPS/BCPS"],
      llm_recommendation: null,
      generated_by: "template",
      confidence_score: 0.86,
      created_at: RAMS_FIXTURE_GENERATED_AT
    },
    {
      id: 2,
      source_event_id: 13,
      trainset_id: "KA_DATA_DUMMY",
      car_id: "T102401",
      subsystem: "AC",
      severity: "WATCH",
      title: "AC Temperature Trend",
      summary: "Temperatur kabin meningkat dengan kelembapan tinggi.",
      technical_explanation: "Temperatur 28.4 C dan kelembapan 64 persen perlu dipantau.",
      probable_causes: ["Filter kotor", "Kinerja compressor menurun"],
      recommended_actions: ["Periksa filter", "Bandingkan arus compressor RST"],
      llm_recommendation: { provider: "template", status: "FALLBACK" },
      generated_by: "template",
      confidence_score: 78,
      created_at: "2026-07-13T08:40:00.000Z"
    },
    {
      id: 3,
      source_event_id: null,
      trainset_id: "KA_DUMMY_DATA",
      car_id: null,
      subsystem: "PRESSURE",
      severity: "INFO",
      title: "No Active Anomaly",
      summary: "Tidak ada anomali aktif tambahan.",
      technical_explanation: "Telemetry berada dalam rentang operasional.",
      probable_causes: [],
      recommended_actions: ["Lanjutkan pemantauan rutin"],
      llm_recommendation: null,
      generated_by: "template",
      confidence_score: null,
      created_at: RAMS_FIXTURE_GENERATED_AT
    }
  ]
};

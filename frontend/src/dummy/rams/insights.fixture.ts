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
      llm_recommendation: {
        title: "Brake Cylinder Pressure Deviation",
        summary: "Tekanan brake cylinder C1 berada di bawah batas operasional.",
        technical_explanation: "Brake cylinder 1.1 bar berada di bawah threshold 2.1 bar ketika brake pipe stabil pada 4.2 bar.",
        affected_cars: [
          {
            car_id: "M102401",
            role: "primary",
            reason: "Brake cylinder pressure berada di bawah threshold.",
            confidence: 0.86
          }
        ],
        probable_causes: ["Valve tersendat", "Sensor atau konektor tidak stabil"],
        recommended_actions: ["Periksa valve", "Validasi sensor BPPS/BCPS"],
        inspection_steps: ["Konfirmasi pembacaan BCPS", "Periksa valve dan jalur pneumatic", "Bandingkan dengan brake pipe pressure"],
        safety_notes: ["Lakukan inspeksi sebelum kereta kembali beroperasi jika anomali terkonfirmasi."],
        priority: "HIGH",
        provider: "template",
        model: "rams-demo-structured",
        llm_status: "DUMMY"
      },
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
      llm_recommendation: {
        title: "AC Temperature Trend",
        summary: "Temperatur kabin C2 meningkat dan memerlukan pemantauan.",
        technical_explanation: "Temperatur 28.4 C dan kelembapan 64 persen menunjukkan penurunan performa pendinginan.",
        affected_cars: [
          {
            car_id: "T102401",
            role: "primary",
            reason: "Temperatur dan kelembapan kabin berada di atas pola normal.",
            confidence: 0.78
          }
        ],
        probable_causes: ["Filter kotor", "Kinerja compressor menurun"],
        recommended_actions: ["Periksa filter", "Bandingkan arus compressor RST"],
        inspection_steps: ["Periksa kondisi filter", "Ukur arus compressor", "Validasi sensor temperatur dan kelembapan"],
        safety_notes: ["Pastikan suplai listrik HVAC diisolasi sebelum pemeriksaan fisik."],
        priority: "MEDIUM",
        provider: "template",
        model: "rams-demo-structured",
        llm_status: "DUMMY"
      },
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
      llm_recommendation: {
        title: "No Active Anomaly",
        summary: "Tidak ada anomali aktif tambahan pada data yang tersedia.",
        technical_explanation: "Telemetry berada dalam rentang operasional dan tidak memicu rule aktif.",
        affected_cars: [],
        probable_causes: [],
        recommended_actions: ["Lanjutkan pemantauan rutin"],
        inspection_steps: [],
        safety_notes: [],
        priority: "LOW",
        provider: "template",
        model: "rams-demo-structured",
        llm_status: "DUMMY"
      },
      generated_by: "template",
      confidence_score: null,
      created_at: RAMS_FIXTURE_GENERATED_AT
    }
  ]
};

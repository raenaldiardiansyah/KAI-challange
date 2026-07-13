import type { RamsActiveAlarmsResponse } from "@/types/api";

export const activeAlarmsFixture: RamsActiveAlarmsResponse = {
  ok: true,
  filters: { trainset: null, car: null, subsystem: null, priority: null, limit: 1000 },
  items: [
    {
      trainset: "KA_DATA_DUMMY",
      cars: [
        {
          car: "M102401",
          subsystems: [
            {
              subsystem: "PRESSURE",
              priority: "WARNING",
              error: "Brake cylinder pressure deviation",
              recommendation: "Periksa valve, jalur pneumatic, dan validasi sensor.",
              diagnostic_cases: ["LOCAL_BC_DEVIATION", "LOCAL_BRAKE_ABNORMAL"],
              affected_cars: [{ car_id: "M102401", bp: 4.2, bc: 1.1, role: "alarm_car", confidence: "HIGH" }],
              diagnostic_scope: "LOCAL",
              diagnostic_confidence: "HIGH",
              diagnostic_evidence: ["BC 1.1 bar berada di bawah threshold 2.1 bar.", "BP stabil pada 4.2 bar."]
            }
          ]
        },
        {
          car: "D102405",
          subsystems: [
            {
              subsystem: "PRESSURE",
              priority: "CRITICAL",
              error: "Brake pipe pressure critical low",
              recommendation: "Hentikan operasi gerbong dan lakukan pemeriksaan pneumatic.",
              diagnostic_cases: ["LOCAL_BP_LOW", "LOCAL_BRAKE_ABNORMAL"],
              affected_cars: [{ car_id: "D102405", bp: 3.6, bc: 0.8, role: "alarm_car", confidence: "HIGH" }],
              diagnostic_scope: "LOCAL",
              diagnostic_confidence: "HIGH",
              diagnostic_evidence: ["BP 3.6 bar berada di bawah batas 4.5 bar."]
            }
          ]
        }
      ]
    }
  ]
};

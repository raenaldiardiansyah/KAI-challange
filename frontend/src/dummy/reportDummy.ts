import type { Report } from "@/types/report";

export const reportDummy: Report[] = [
  {
    id: "RPT-001",
    title: "Daily RAMS Insight Summary",
    period: "2 Jul 2026",
    generatedAt: "2026-07-02T17:00:00+07:00",
    summary: "3 trainset monitored, 2 high priority issues, 1 maintenance action recommended.",
    type: "Insight"
  },
  {
    id: "RPT-002",
    title: "Alarm Trend Weekly",
    period: "26 Jun - 2 Jul 2026",
    generatedAt: "2026-07-02T17:05:00+07:00",
    summary: "Brake and door telemetry account for most warning-level events this week.",
    type: "Alarm"
  },
  {
    id: "RPT-003",
    title: "Predictive Risk Report",
    period: "26 Jun - 2 Jul 2026",
    generatedAt: "2026-07-02T17:10:00+07:00",
    summary: "Daftar aset dengan probabilitas risiko tertinggi, estimasi TTW, dan rekomendasi inspeksi.",
    type: "Maintenance"
  },
  {
    id: "RPT-004",
    title: "Telemetry Quality",
    period: "2 Jul 2026",
    generatedAt: "2026-07-02T17:12:00+07:00",
    summary: "Kualitas data sensor, topik MQTT mapped/unmapped, dan sinyal yang perlu validasi.",
    type: "Telemetry"
  },
  {
    id: "RPT-005",
    title: "Maintenance Effectiveness",
    period: "Juli 2026",
    generatedAt: "2026-07-02T17:18:00+07:00",
    summary: "Evaluasi efektivitas tindak lanjut SPK terhadap penurunan alarm dan health recovery.",
    type: "Maintenance"
  },
  {
    id: "RPT-006",
    title: "Subsystem Reliability",
    period: "Juli 2026",
    generatedAt: "2026-07-02T17:20:00+07:00",
    summary: "Ringkasan reliability Brake, HVAC, Door, Genset, dan Controller per armada.",
    type: "Reliability"
  }
];

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
  }
];

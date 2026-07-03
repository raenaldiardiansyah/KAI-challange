import type { MaintenanceRisk } from "@/types/maintenance";

export const maintenanceDummy: MaintenanceRisk[] = [
  {
    id: "PM-001",
    trainsetId: "TS-001",
    carNumber: 5,
    subsystem: "Brake System",
    severity: "High",
    riskScore: 84,
    timeToWarning: "12 jam",
    recommendation: "Inspeksi brake cylinder dan valve sebelum keberangkatan berikutnya.",
    workOrderReady: true
  },
  {
    id: "PM-002",
    trainsetId: "TS-002",
    carNumber: 2,
    subsystem: "Genset",
    severity: "Medium",
    riskScore: 61,
    timeToWarning: "2 hari",
    recommendation: "Pantau tren frekuensi dan lakukan pengecekan governor.",
    workOrderReady: false
  }
];

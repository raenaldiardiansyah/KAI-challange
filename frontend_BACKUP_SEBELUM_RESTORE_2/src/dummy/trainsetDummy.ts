import type { Trainset } from "@/types/trainset";

export const trainsetDummy: Trainset[] = [
  {
    id: "TS-001",
    name: "Anggrek Lembah M02406",
    route: "Gambir - Surabaya Pasar Turi",
    totalCars: 10,
    online: true,
    dataStatus: "Online",
    lastUpdate: "2026-07-02T16:55:00+07:00",
    healthScore: 68,
    healthStatus: "Warning",
    alarmCount: 3,
    location: "KM 184+200"
  },
  {
    id: "TS-002",
    name: "Argo Wilis M02511",
    route: "Bandung - Surabaya Gubeng",
    totalCars: 9,
    online: true,
    dataStatus: "Delayed",
    lastUpdate: "2026-07-02T16:43:00+07:00",
    healthScore: 82,
    healthStatus: "Watch",
    alarmCount: 1,
    location: "KM 92+800"
  },
  {
    id: "TS-003",
    name: "Lodaya M02103",
    route: "Solo Balapan - Bandung",
    totalCars: 8,
    online: false,
    dataStatus: "Disconnected",
    lastUpdate: "2026-07-02T15:58:00+07:00",
    healthScore: 48,
    healthStatus: "Data Limited",
    alarmCount: 2,
    location: "Last known: KM 311+400"
  }
];

import type { MapPoint } from "@/adapters/mapAdapter";

export const mapDummy: MapPoint[] = [
  {
    trainsetId: "TS-001",
    trainName: "Anggrek Lembah M02406",
    route: "Gambir - Surabaya Pasar Turi",
    lat: -6.9147,
    lng: 107.6098,
    label: "KM 184+200 - Bandung corridor",
    status: "Warning",
    health: 68,
    lastUpdate: "12:30:45"
  },
  {
    trainsetId: "TS-002",
    trainName: "Argo Wilis M02511",
    route: "Bandung - Surabaya Gubeng",
    lat: -7.2504,
    lng: 110.2177,
    label: "Central Java corridor",
    status: "Watch",
    health: 82,
    lastUpdate: "12:27:34"
  },
  {
    trainsetId: "TS-003",
    trainName: "Lodaya M02103",
    route: "Solo Balapan - Bandung",
    lat: -7.5570,
    lng: 110.8210,
    label: "Last known near Solo Balapan corridor",
    status: "Data Limited",
    health: 48,
    lastUpdate: "12:28:05"
  }
];

import type { RamsTrainDto } from "@/types/api";
import type { Trainset } from "@/types/trainset";
import { getTrainsetIdentity } from "./identityAdapter";
import { normalizeScore, formatTimestamp } from "./normalizers";
import { adaptDataStatus, adaptHealthStatus } from "./statusAdapter";

const trainsetRoutes: Record<string, string> = {
  KA_DATA_DUMMY: "Gambir - Surabaya Pasar Turi",
  KA_DUMMY_DATA: "Bandung - Surabaya Gubeng",
  KA_OFFLINE_DEMO: "Solo Balapan - Bandung",
  KA_TAKSAKA_DEMO: "Yogyakarta - Gambir",
  KA_MALIOBORO_DEMO: "Yogyakarta - Malang",
  KA_MUTIARA_DEMO: "Bandung - Surabaya Gubeng",
  KA_SENJA_DEMO: "Pasar Senen - Yogyakarta",
  KA_GAJAYANA_DEMO: "Gambir - Malang",
  KA_TURANGGA_DEMO: "Bandung - Surabaya Gubeng",
  KA_BIMA_DEMO: "Gambir - Surabaya Gubeng"
};

export function adaptTrainset(dto: RamsTrainDto): Trainset {
  const identity = getTrainsetIdentity(dto.trainset_id, dto.display_name);
  const normalizedStatus = dto.status.toUpperCase();
  const online = !["OFFLINE", "DISCONNECTED", "ERROR"].includes(normalizedStatus);
  return {
    id: dto.trainset_id,
    name: `${identity.displayCode} · ${identity.displayName}`,
    route: trainsetRoutes[dto.trainset_id] ?? "Belum tersedia",
    totalCars: dto.total_cars,
    online,
    dataStatus: online && !["DELAYED", "STALE"].includes(normalizedStatus) ? "Online" : adaptDataStatus(dto.status),
    lastUpdate: formatTimestamp(dto.last_update),
    healthScore: normalizeScore(dto.health_score),
    healthStatus: adaptHealthStatus(dto.status),
    alarmCount: dto.active_alarm_count,
    speedKph: dto.position?.speed_kph ?? null,
    location: dto.position?.latitude != null && dto.position.longitude != null
      ? `${dto.position.latitude.toFixed(5)}, ${dto.position.longitude.toFixed(5)}`
      : "Belum tersedia"
  };
}

export function adaptTrainsets(items: RamsTrainDto[]) {
  return items.map(adaptTrainset);
}

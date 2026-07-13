import type { RamsTrainDto } from "@/types/api";
import type { Trainset } from "@/types/trainset";
import { getTrainsetIdentity } from "./identityAdapter";
import { normalizeScore, formatTimestamp } from "./normalizers";
import { adaptDataStatus, adaptHealthStatus } from "./statusAdapter";

export function adaptTrainset(dto: RamsTrainDto): Trainset {
  const identity = getTrainsetIdentity(dto.trainset_id, dto.display_name);
  const normalizedStatus = dto.status.toUpperCase();
  const online = !["OFFLINE", "DISCONNECTED", "ERROR"].includes(normalizedStatus);
  return {
    id: dto.trainset_id,
    name: `${identity.displayCode} · ${identity.displayName}`,
    route: "Belum tersedia",
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

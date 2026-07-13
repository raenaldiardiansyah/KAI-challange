import type { RamsTrainDto } from "@/types/api";
import type { Trainset } from "@/types/trainset";
import { getTrainsetIdentity } from "./identityAdapter";
import { normalizeScore, formatTimestamp } from "./normalizers";
import { adaptDataStatus, adaptHealthStatus } from "./statusAdapter";

export function adaptTrainset(dto: RamsTrainDto): Trainset {
  const identity = getTrainsetIdentity(dto.trainset_id, dto.display_name);
  return {
    id: dto.trainset_id,
    name: `${identity.displayCode} · ${identity.displayName}`,
    route: "Belum tersedia",
    totalCars: dto.total_cars,
    online: dto.status.toUpperCase() === "ONLINE",
    dataStatus: adaptDataStatus(dto.status),
    lastUpdate: formatTimestamp(dto.last_update),
    healthScore: normalizeScore(dto.health_score),
    healthStatus: adaptHealthStatus(dto.status),
    alarmCount: dto.active_alarm_count,
    location: dto.position?.latitude != null && dto.position.longitude != null
      ? `${dto.position.latitude.toFixed(5)}, ${dto.position.longitude.toFixed(5)}`
      : "Belum tersedia"
  };
}

export function adaptTrainsets(items: RamsTrainDto[]) {
  return items.map(adaptTrainset);
}

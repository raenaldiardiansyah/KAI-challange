import type { RamsFrontendPositionDto, RamsMapItemDto } from "@/types/api";
import { getTrainsetIdentity } from "./identityAdapter";
import { adaptHealthStatus } from "./statusAdapter";
import { formatTimestamp } from "./normalizers";

export type MapPoint = {
  trainsetId: string;
  trainName: string;
  route: string;
  lat: number;
  lng: number;
  label: string;
  status: ReturnType<typeof adaptHealthStatus>;
  health: number;
  lastUpdate: string;
  speed?: number;
};

export function adaptFrontendPosition(dto: RamsFrontendPositionDto): MapPoint | null {
  if (dto.latitude == null || dto.longitude == null) return null;
  const identity = getTrainsetIdentity(dto.trainset_id, dto.display_name);
  return {
    trainsetId: dto.trainset_id,
    trainName: `${identity.displayCode} · ${identity.displayName}`,
    route: "Prototype",
    lat: dto.latitude,
    lng: dto.longitude,
    label: `${dto.latitude.toFixed(5)}, ${dto.longitude.toFixed(5)}`,
    status: adaptHealthStatus(dto.status),
    health: 0,
    lastUpdate: formatTimestamp(dto.last_update),
    speed: dto.speed_kph ?? undefined
  };
}

export function adaptMapItem(dto: RamsMapItemDto): MapPoint | null {
  if (dto.lat == null || dto.long == null) return null;
  const identity = getTrainsetIdentity(dto.trainset);
  return {
    trainsetId: dto.trainset,
    trainName: `${identity.displayCode} · ${identity.displayName}`,
    route: "Prototype",
    lat: dto.lat,
    lng: dto.long,
    label: `${dto.lat.toFixed(5)}, ${dto.long.toFixed(5)}`,
    status: "Data Limited",
    health: 0,
    lastUpdate: "Belum tersedia",
    speed: dto.speed ?? undefined
  };
}

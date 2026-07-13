import type { RamsMapsResponse, RamsTrainsetListResponse } from "@/types/api";
import type { Trainset } from "@/types/trainset";
import type { MapPoint } from "@/adapters/mapAdapter";
import { adaptMapItem } from "@/adapters/mapAdapter";
import { adaptHealthStatus } from "@/adapters/statusAdapter";
import { formatTimestamp, normalizeScore } from "@/adapters/normalizers";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { getTrainsetIdentity } from "@/adapters/identityAdapter";
import { requestRams, type RamsApiResult } from "./api/ramsApiClient";

export type LiveMonitoringData = { points: MapPoint[]; trainsets: Trainset[] };

export async function getLiveMonitoringData(signal?: AbortSignal): Promise<RamsApiResult<LiveMonitoringData>> {
  const [maps, trains] = await Promise.all([
    requestRams<RamsMapsResponse>("/frontend/maps", { signal }),
    requestRams<RamsTrainsetListResponse>("/trainsets", { signal })
  ]);
  const trainById = new Map(trains.data.trains.map((train) => [train.trainset_id, train]));
  const points = maps.data.items.map((item) => {
    const point = adaptMapItem(item);
    const train = trainById.get(item.trainset);
    if (!point) return null;
    const identity = getTrainsetIdentity(item.trainset, train?.display_name);
    return {
      ...point,
      trainName: `${identity.displayCode} · ${identity.displayName}`,
      status: adaptHealthStatus(train?.status),
      health: normalizeScore(train?.health_score),
      lastUpdate: formatTimestamp(train?.last_update)
    };
  }).filter((item): item is MapPoint => Boolean(item));
  return {
    data: { points, trainsets: adaptTrainsets(trains.data.trains) },
    source: maps.source === "cache" || trains.source === "cache" ? "cache" : "live",
    stale: maps.stale || trains.stale,
    fetchedAt: maps.fetchedAt > trains.fetchedAt ? maps.fetchedAt : trains.fetchedAt
  };
}

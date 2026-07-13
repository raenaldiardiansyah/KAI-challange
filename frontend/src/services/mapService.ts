import type { RamsMapsResponse, RamsTrainsetListResponse } from "@/types/api";
import type { Trainset } from "@/types/trainset";
import type { MapPoint } from "@/adapters/mapAdapter";
import { adaptMapItem } from "@/adapters/mapAdapter";
import { adaptHealthStatus } from "@/adapters/statusAdapter";
import { formatTimestamp, normalizeScore } from "@/adapters/normalizers";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { getTrainsetIdentity } from "@/adapters/identityAdapter";
import { frontendMapsFixture, trainsetsFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, type RamsApiResult } from "./api/ramsApiClient";

export type LiveMonitoringData = { points: MapPoint[]; trainsets: Trainset[] };

export async function getLiveMonitoringData(signal?: AbortSignal, mode: DataMode = "live"): Promise<RamsApiResult<LiveMonitoringData>> {
  const [maps, trains] = await Promise.all([
    loadRams<RamsMapsResponse>(mode, "/frontend/maps", frontendMapsFixture, { signal }),
    loadRams<RamsTrainsetListResponse>(mode, "/trainsets", trainsetsFixture, { signal })
  ]);
  const trainById = new Map(trains.data.trains.map((train) => [train.trainset_id, train]));
  const points = maps.data.items.map((item): MapPoint | null => {
    const point = adaptMapItem(item);
    const train = trainById.get(item.trainset);
    if (!point) return null;
    const identity = getTrainsetIdentity(item.trainset, train?.display_name);
    return {
      ...point,
      trainName: `${identity.displayCode} · ${identity.displayName}`,
      status: adaptHealthStatus(train?.status),
      health: normalizeScore(train?.health_score),
      lastUpdate: formatTimestamp(train?.last_update),
      alarmCount: train?.active_alarm_count ?? null
    };
  }).filter((item): item is MapPoint => Boolean(item));
  return {
    data: { points, trainsets: adaptTrainsets(trains.data.trains) },
    ...mergeRamsMetadata([maps, trains])
  };
}

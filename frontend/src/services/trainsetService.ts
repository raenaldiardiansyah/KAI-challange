import type { Trainset } from "@/types/trainset";
import type { RamsFrontendTrainsetsResponse, RamsTrainsetHealthResponse, RamsTrainsetListResponse } from "@/types/api";
import type { Insight } from "@/types/insight";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { adaptTrainCarToInsight } from "@/adapters/frontendStateAdapter";
import { getCarIdentity } from "@/adapters/identityAdapter";
import { adaptDataStatus, adaptHealthStatus } from "@/adapters/statusAdapter";
import { normalizeScore } from "@/adapters/normalizers";
import { safeJsonArray } from "@/lib/safeJson";
import { frontendTrainsetsFixture, trainsetHealthFixture, trainsetsFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, type RamsApiResult } from "./api/ramsApiClient";

export type TrainsetPageData = { trainsets: Trainset[]; carInsights: Insight[] };

export async function getTrainsetPageData(signal?: AbortSignal, mode: DataMode = "live"): Promise<RamsApiResult<TrainsetPageData>> {
  const settled = await Promise.allSettled([
    loadRams<RamsFrontendTrainsetsResponse>(mode, "/frontend/trainsets", frontendTrainsetsFixture, { signal, query: { limit: 1000, offset: 0 } }),
    loadRams<RamsTrainsetListResponse>(mode, "/trainsets", trainsetsFixture, { signal }),
    loadRams<RamsTrainsetHealthResponse>(mode, "/frontend/trainset-health-state", trainsetHealthFixture, { signal })
  ]);
  const registry = settled[0].status === "fulfilled" ? settled[0].value : null;
  if (settled[1].status === "rejected") throw settled[1].reason;
  const live = settled[1].value;
  const health = settled[2].status === "fulfilled" ? settled[2].value : null;
  const registered = new Set(registry?.data.items.map((item) => item.trainset) ?? []);
  const trains = live.data.trains.filter((train) => registered.size === 0 || registered.has(train.trainset_id));
  const healthByTrain = new Map(health?.data.items.map((item) => [item.trainset_id, item]) ?? []);
  const adaptedTrainsets = adaptTrainsets(trains).map((trainset) => {
    const item = healthByTrain.get(trainset.id);
    if (!item) return trainset;
    const carSummary = safeJsonArray<Record<string, unknown>>(item.car_summary_json);
    return {
      ...trainset,
      healthScore: normalizeScore(item.health_score),
      healthStatus: adaptHealthStatus(item.display_status),
      dataStatus: adaptDataStatus(item.data_status),
      totalCars: item.total_cars,
      onlineCars: item.online_cars,
      healthBreakdown: {
        critical: item.critical_car_count,
        warning: item.warning_car_count,
        watch: item.watch_car_count,
        offline: item.offline_car_count,
        degraded: item.degraded_car_count
      },
      carHealthSummary: carSummary.map((car) => {
        const carId = typeof car.car_id === "string" ? car.car_id : "Belum tersedia";
        const identity = getCarIdentity(item.trainset_id, carId);
        return {
          carId,
          displayCode: identity.displayCode,
          healthScore: typeof car.health_score === "number" ? normalizeScore(car.health_score) : null,
          status: typeof car.display_status === "string" ? car.display_status : "Belum tersedia",
          dataStatus: typeof car.data_status === "string" ? car.data_status : "Belum tersedia"
        };
      }),
      healthSource: item.source,
      healthGeneratedAt: item.updated_at ?? item.last_update
    };
  });
  const metadataResults: RamsApiResult<unknown>[] = [live, ...(registry ? [registry] : []), ...(health ? [health] : [])];
  return {
    data: {
      trainsets: adaptedTrainsets,
      carInsights: trains.flatMap((train) => train.cars.map((car) => adaptTrainCarToInsight(train.trainset_id, car)))
    },
    ...mergeRamsMetadata(metadataResults)
  };
}

/** @deprecated Remaining callers are migrated phase-by-phase to getTrainsetPageData. */
export async function getTrainsets(): Promise<Trainset[]> {
  return adaptTrainsets(trainsetsFixture.trains);
}

export async function getTrainset(id: string): Promise<Trainset | undefined> {
  return adaptTrainsets(trainsetsFixture.trains).find((trainset) => trainset.id === id);
}

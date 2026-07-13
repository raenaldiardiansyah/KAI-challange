import { trainsetDummy } from "@/dummy/trainsetDummy";
import { carInsightsDummy } from "@/dummy/insightDummy";
import type { Trainset } from "@/types/trainset";
import type { RamsFrontendTrainsetsResponse, RamsTrainsetListResponse } from "@/types/api";
import type { Insight } from "@/types/insight";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { adaptTrainCarToInsight } from "@/adapters/frontendStateAdapter";
import { requestRams, type RamsApiResult } from "./api/ramsApiClient";

export type TrainsetPageData = { trainsets: Trainset[]; carInsights: Insight[] };

export const trainsetPageDummyData: TrainsetPageData = {
  trainsets: trainsetDummy,
  carInsights: carInsightsDummy
};

export async function getTrainsetPageData(signal?: AbortSignal): Promise<RamsApiResult<TrainsetPageData>> {
  const [registry, live] = await Promise.all([
    requestRams<RamsFrontendTrainsetsResponse>("/frontend/trainsets", { signal, query: { limit: 1000, offset: 0 } }),
    requestRams<RamsTrainsetListResponse>("/trainsets", { signal })
  ]);
  const registered = new Set(registry.data.items.map((item) => item.trainset));
  const trains = live.data.trains.filter((train) => registered.size === 0 || registered.has(train.trainset_id));
  return {
    data: {
      trainsets: adaptTrainsets(trains),
      carInsights: trains.flatMap((train) => train.cars.map((car) => adaptTrainCarToInsight(train.trainset_id, car)))
    },
    source: registry.source === "cache" || live.source === "cache" ? "cache" : "live",
    stale: registry.stale || live.stale,
    fetchedAt: registry.fetchedAt > live.fetchedAt ? registry.fetchedAt : live.fetchedAt
  };
}

/** @deprecated Remaining callers are migrated phase-by-phase to getTrainsetPageData. */
export async function getTrainsets(): Promise<Trainset[]> {
  return trainsetDummy;
}

export async function getTrainset(id: string): Promise<Trainset | undefined> {
  return trainsetDummy.find((trainset) => trainset.id === id);
}

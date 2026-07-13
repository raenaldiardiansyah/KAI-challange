import type { Alarm } from "@/types/alarm";
import type { Insight } from "@/types/insight";
import type { MaintenanceRisk } from "@/types/maintenance";
import type { Trainset } from "@/types/trainset";
import type { RamsFrontendStateDto } from "@/types/api";
import type { MapPoint } from "@/adapters/mapAdapter";
import { adaptFrontendState } from "@/adapters/frontendStateAdapter";
import { frontendStateFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mapRamsResult } from "./api/ramsApiClient";

export type OverviewData = {
  summary: {
    onlineTrainsets: number;
    totalTrainsets: number;
    totalCars: number;
    onlineCars: number;
    criticalAlarms: number;
    dataAvailabilityPercent: number;
    globalHealthScore: number;
    activeAlarms: number;
    predictiveRisks: number;
    insightCount: number;
    showTrends: boolean;
  };
  trainsets: Trainset[];
  priorityInsight: Insight | null;
  insights: Insight[];
  carInsights: Insight[];
  trainsetCompositions: Array<{
    trainsetId: string;
    displayCode: string;
    displayName: string;
    totalCars: number;
    carInsights: Insight[];
  }>;
  alarms: Alarm[];
  maintenance: MaintenanceRisk[];
  mapPoints: MapPoint[];
};

export async function getOverviewData(signal?: AbortSignal, mode: DataMode = "live") {
  const result = await loadRams<RamsFrontendStateDto>(mode, "/frontend/state", frontendStateFixture, { signal });
  return mapRamsResult(result, adaptFrontendState);
}

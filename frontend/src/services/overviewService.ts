import type { Alarm } from "@/types/alarm";
import type { Insight } from "@/types/insight";
import type { MaintenanceRisk } from "@/types/maintenance";
import type { Trainset } from "@/types/trainset";
import type { RamsFrontendStateDto } from "@/types/api";
import type { MapPoint } from "@/adapters/mapAdapter";
import { adaptFrontendState } from "@/adapters/frontendStateAdapter";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export type OverviewData = {
  summary: {
    onlineTrainsets: number;
    totalTrainsets: number;
    totalCars: number;
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
  alarms: Alarm[];
  maintenance: MaintenanceRisk[];
  mapPoints: MapPoint[];
};

export async function getOverviewData(signal?: AbortSignal) {
  const result = await requestRams<RamsFrontendStateDto>("/frontend/state", { signal });
  return mapRamsResult(result, adaptFrontendState);
}

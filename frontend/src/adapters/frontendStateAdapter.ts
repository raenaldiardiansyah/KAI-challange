import type { RamsFrontendStateDto, RamsTrainCarDto } from "@/types/api";
import type { Insight } from "@/types/insight";
import { adaptAlarms } from "./alarmAdapter";
import { adaptInsights } from "./insightAdapter";
import { getCarIdentity, getTrainsetIdentity } from "./identityAdapter";
import { adaptFrontendPosition } from "./mapAdapter";
import { adaptPredictiveList } from "./predictiveAdapter";
import { adaptSeverity, adaptSubsystem } from "./statusAdapter";
import { adaptTrainsets } from "./trainsetAdapter";
import type { OverviewData } from "@/services/overviewService";

export function adaptTrainCarToInsight(trainsetId: string, car: RamsTrainCarDto): Insight {
  const trainset = getTrainsetIdentity(trainsetId);
  const identity = getCarIdentity(trainsetId, car.car_id);
  const primary = car.subsystems[0];
  return {
    id: `health:${trainsetId}:${car.car_id}`,
    trainsetId,
    trainsetName: trainset.displayCode,
    carNumber: identity.order,
    subsystem: adaptSubsystem(primary?.subsystem),
    event: primary ? `${primary.subsystem}_${primary.status}` : "DATA_STATUS",
    severity: adaptSeverity(primary?.status ?? car.status),
    confidence: 0,
    healthScore: car.health_score ?? 0,
    diagnosis: "Insight RAMS belum tersedia untuk gerbong ini.",
    risk: car.status,
    evidence: { backendCarId: car.car_id, source: "frontend/state" },
    structuredInsight: { source: "DERIVED", backendCarId: car.car_id },
    naturalInsight: "Status diturunkan dari snapshot kesehatan gerbong.",
    recommendation: "Tinjau detail gerbong dan data sensor terbaru."
  };
}

export function adaptFrontendState(dto: RamsFrontendStateDto): OverviewData {
  const liveInsights = adaptInsights(dto.insights);
  const derivedInsights = dto.trains.flatMap((train) => train.cars.map((car) => adaptTrainCarToInsight(train.trainset_id, car)));
  return {
    summary: {
      onlineTrainsets: dto.metrics.online_trains,
      totalTrainsets: dto.metrics.total_trains,
      totalCars: dto.metrics.total_cars,
      globalHealthScore: dto.metrics.average_health_score,
      activeAlarms: dto.metrics.active_alarms,
      predictiveRisks: dto.predictive.length,
      insightCount: dto.insights.length + dto.llm_recommendations.length,
      showTrends: false
    },
    trainsets: adaptTrainsets(dto.trains),
    priorityInsight: liveInsights[0] ?? derivedInsights[0] ?? null,
    insights: liveInsights,
    carInsights: liveInsights.length ? liveInsights : derivedInsights,
    alarms: adaptAlarms(dto.alarms),
    maintenance: adaptPredictiveList(dto.predictive),
    mapPoints: dto.positions.map(adaptFrontendPosition).filter((item): item is NonNullable<typeof item> => Boolean(item))
  };
}

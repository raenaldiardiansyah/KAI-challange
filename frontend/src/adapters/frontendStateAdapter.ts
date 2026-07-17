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
    recommendation: "Tinjau detail gerbong dan data sensor terbaru.",
    carId: car.car_id
  };
}

export function adaptFrontendState(dto: RamsFrontendStateDto): OverviewData {
  const liveInsights = adaptInsights(dto.insights);
  const derivedInsights = dto.trains.flatMap((train) => train.cars.map((car) => adaptTrainCarToInsight(train.trainset_id, car)));
  const liveInsightByCar = new Map(liveInsights
    .filter((insight) => insight.carId)
    .map((insight) => [`${insight.trainsetId}:${insight.carId}`, insight]));
  const mergedCarInsights = derivedInsights.map((derived) => {
    const live = derived.carId ? liveInsightByCar.get(`${derived.trainsetId}:${derived.carId}`) : undefined;
    return live ? { ...live, healthScore: derived.healthScore } : derived;
  });
  const derivedKeys = new Set(derivedInsights.filter((insight) => insight.carId).map((insight) => `${insight.trainsetId}:${insight.carId}`));
  mergedCarInsights.push(...liveInsights.filter((insight) => !insight.carId || !derivedKeys.has(`${insight.trainsetId}:${insight.carId}`)));
  const primaryTrainsetId = dto.trains[0]?.trainset_id;
  const overviewCarInsights = primaryTrainsetId
    ? mergedCarInsights.filter((insight) => insight.trainsetId === primaryTrainsetId)
    : mergedCarInsights;
  const trainsetCompositions = dto.trains.map((train) => {
    const identity = getTrainsetIdentity(train.trainset_id, train.display_name);
    const cars = train.cars.map((car) => {
      const carIdentity = getCarIdentity(train.trainset_id, car.car_id);
      return {
        carId: car.car_id,
        carNumber: carIdentity.order > 0 ? carIdentity.order : null
      };
    });
    return {
      trainsetId: train.trainset_id,
      displayCode: identity.displayCode,
      displayName: identity.displayName,
      totalCars: cars.length || train.total_cars,
      cars,
      carInsights: mergedCarInsights
        .filter((insight) => insight.trainsetId === train.trainset_id)
        .sort((left, right) => left.carNumber - right.carNumber)
    };
  });
  return {
    summary: {
      onlineTrainsets: dto.metrics.online_trains,
      totalTrainsets: dto.metrics.total_trains,
      totalCars: dto.metrics.total_cars,
      onlineCars: dto.metrics.online_cars,
      criticalAlarms: dto.metrics.critical_alarms,
      dataAvailabilityPercent: dto.metrics.data_availability_percent,
      globalHealthScore: dto.metrics.average_health_score,
      activeAlarms: dto.metrics.active_alarms,
      predictiveRisks: dto.predictive.length,
      insightCount: dto.insights.length + dto.llm_recommendations.length,
      showTrends: false
    },
    trainsets: adaptTrainsets(dto.trains),
    priorityInsight: mergedCarInsights[0] ?? null,
    insights: liveInsights,
    carInsights: overviewCarInsights,
    trainsetCompositions,
    alarms: adaptAlarms(dto.alarms),
    maintenance: adaptPredictiveList(dto.predictive),
    mapPoints: dto.positions.map(adaptFrontendPosition).filter((item): item is NonNullable<typeof item> => Boolean(item))
  };
}

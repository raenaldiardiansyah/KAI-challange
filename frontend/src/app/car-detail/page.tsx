"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CarIdentityHealthSummary } from "@/features/car-detail/CarIdentityHealthSummary";
import { CarLlmSummary } from "@/features/car-detail/CarLlmSummary";
import { CarSelectorFilter } from "@/features/car-detail/CarSelectorFilter";
import { CarDetailInvestigationTabs } from "@/features/car-detail/CarDetailInvestigationTabs";
import { getCarPageData, type CarPageData } from "@/services/carDetailService";
import type { CarDetail } from "@/types/car";
import { adaptSubsystem } from "@/adapters/statusAdapter";
import { resolveCarId, resolveTrainsetId } from "@/adapters/identityAdapter";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

function buildFallbackCar(trainsetId: string, carNumber: number, healthScore: number): CarDetail {
  const isIssue = healthScore < 80;
  return {
    id: `CAR-${trainsetId}-${String(carNumber).padStart(2, "0")}`,
    trainsetId,
    carNumber,
    role: "Passenger Car",
    healthScore,
    healthStatus: isIssue ? "Warning" : "Healthy",
    brakePipeBar: 4.2,
    brakeCylinderBar: isIssue ? 1.7 : 2.2,
    gensetVoltage: 380,
    gensetFrequency: 49.8,
    gensetRpm: 1450,
    fuelLevel: 62,
    hvacTemperature: 25.4,
    doorOpenCount: 18,
    doorStatus: "Closed",
    subsystems: [
      { subsystem: isIssue ? "Brake System" : "Door", healthScore, status: isIssue ? "Warning" : "Healthy", evidence: "Indikasi data demonstrasi" },
      { subsystem: "HVAC", healthScore: 88, status: "Healthy", evidence: "Temperature stable" },
      { subsystem: "Door", healthScore: 90, status: "Healthy", evidence: "Door cycle normal" }
    ]
  };
}

function backendSubsystem(label: string) {
  if (label === "Brake System") return "PRESSURE";
  if (label === "HVAC") return "AC";
  return label.toUpperCase().replaceAll(" ", "_");
}

export default function CarDetailPage() {
  const searchParams = useSearchParams();
  const trainsetQuery = searchParams.get("trainset") ?? undefined;
  const carQuery = searchParams.get("car") ?? undefined;
  const subsystemQuery = searchParams.get("subsystem") ?? undefined;
  const loader = useCallback(
    (signal: AbortSignal, mode: "dummy" | "live") => getCarPageData({ trainsetId: trainsetQuery, carId: carQuery, subsystem: subsystemQuery }, signal, mode),
    [carQuery, subsystemQuery, trainsetQuery]
  );
  const resource = useRamsResource<CarPageData>(loader, 30_000);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.cars.length === 0 || resource.data.trainsets.length === 0) {
    return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;
  }

  const {
    cars,
    telemetry,
    trainsets,
    insights,
    carOptionsByTrainset,
    selectedTrainsetId: defaultTrainsetId,
    selectedCarId,
    telemetryRecords,
    partialErrors
  } = resource.data;
  const issueMap = new Map<string, Set<number>>();
  const addIssue = (trainsetId: string, carNumber: number) => {
    if (!issueMap.has(trainsetId)) issueMap.set(trainsetId, new Set<number>());
    issueMap.get(trainsetId)?.add(carNumber);
  };
  cars.forEach((candidate) => {
    if (candidate.healthScore < 80 || candidate.healthStatus === "Alarm" || candidate.healthStatus === "Warning") addIssue(candidate.trainsetId, candidate.carNumber);
  });
  insights.forEach((insight) => {
    if (insight.trainsetId !== "ALL" && insight.severity !== "Normal") addIssue(insight.trainsetId, insight.carNumber);
  });

  const selectedTrainsetId = trainsetQuery ? resolveTrainsetId(trainsetQuery) : defaultTrainsetId;
  const selectedTrainset = trainsets.find((trainset) => trainset.id === selectedTrainsetId) ?? trainsets[0];
  const normalizedCarQuery = carQuery && /^\d+$/.test(carQuery) ? `C${carQuery}` : carQuery;
  const requestedCarId = normalizedCarQuery ? resolveCarId(selectedTrainset.id, normalizedCarQuery) : selectedCarId;
  const exactCar = cars.find((candidate) => candidate.trainsetId === selectedTrainset.id && candidate.id === requestedCarId);
  if (!exactCar) {
    return <DataUnavailableState message="Gerbong RAMS yang dipilih tidak tersedia." onRetry={resource.retry} />;
  }
  const targetCarNumber = exactCar.carNumber;
  const selectedInsight = insights.find((insight) => insight.trainsetId === selectedTrainset.id && insight.carNumber === targetCarNumber);
  const car = exactCar ?? buildFallbackCar(selectedTrainset.id, targetCarNumber, selectedInsight?.healthScore ?? selectedTrainset.healthScore);
  const selectedSubsystemLabel = !subsystemQuery || subsystemQuery === "all"
    ? "all"
    : adaptSubsystem(backendSubsystem(subsystemQuery));
  const visibleCar = selectedSubsystemLabel === "all"
    ? car
    : { ...car, subsystems: car.subsystems.filter((subsystem) => subsystem.subsystem === selectedSubsystemLabel) };
  const selectedTelemetry = telemetry.find((series) => series.trainsetId === car.trainsetId && series.carNumber === car.carNumber);
  const issueTrainsets = trainsets.filter((trainset) => issueMap.has(trainset.id) || !["Healthy", "Watch"].includes(trainset.healthStatus)).map((trainset) => trainset.id);
  const issueCarsByTrainset = Object.fromEntries(Array.from(issueMap.entries()).map(([trainsetId, carNumbers]) => [trainsetId, Array.from(carNumbers).sort((a, b) => a - b)]));
  const selectedCarValue = car.id;
  const subsystemOptions = car.subsystems.map((subsystem) => ({ value: backendSubsystem(subsystem.subsystem), label: subsystem.subsystem }));

  return (
    <div className="page-grid">
      <CarDetailInvestigationTabs
        car={visibleCar}
        telemetry={selectedTelemetry}
        telemetryRecords={telemetryRecords}
        filterContent={
          <CarSelectorFilter
            defaultCar={selectedCarValue}
            defaultTrainset={selectedTrainset.id}
            defaultSubsystem={subsystemQuery ?? "all"}
            trainsets={trainsets.map((trainset) => ({ id: trainset.id, name: trainset.name }))}
            issueTrainsets={issueTrainsets}
            issueCarsByTrainset={issueCarsByTrainset}
            totalCarsByTrainset={Object.fromEntries(trainsets.map((trainset) => [trainset.id, trainset.totalCars]))}
            carOptionsByTrainset={carOptionsByTrainset}
            availableSubsystems={subsystemOptions}
          />
        }
        headerContent={
          <>
            {partialErrors.length ? <div role="status" style={{ color: "#92400e", fontSize: 11, marginBottom: 6 }}>Data parsial: {partialErrors.join(" · ")}</div> : null}
            <div className="car-detail-summary-grid">
              <CarIdentityHealthSummary car={visibleCar} />
              <CarLlmSummary car={visibleCar} insight={selectedInsight} />
            </div>
          </>
        }
      />
    </div>
  );
}

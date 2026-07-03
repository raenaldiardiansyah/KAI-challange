import { CarDetailHeader } from "@/features/car-detail/CarDetailHeader";
import { CarHealthSummary } from "@/features/car-detail/CarHealthSummary";
import { CarSelectorFilter } from "@/features/car-detail/CarSelectorFilter";
import { CarDetailInvestigationTabs } from "@/features/car-detail/CarDetailInvestigationTabs";
import { getCarDetails } from "@/services/carDetailService";
import { getInsights } from "@/services/insightService";
import { getTelemetry } from "@/services/telemetryService";
import { getTrainsets } from "@/services/trainsetService";
import type { CarDetail } from "@/types/car";

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
      {
        subsystem: isIssue ? "Brake System" : "Door",
        healthScore,
        status: isIssue ? "Warning" : "Healthy",
        evidence: isIssue ? "Indikasi dari insight/alarm armada terpilih" : "Tidak ada anomali utama"
      },
      { subsystem: "HVAC", healthScore: 88, status: "Healthy", evidence: "Temperature stable" },
      { subsystem: "Door", healthScore: 90, status: "Healthy", evidence: "Door cycle normal" }
    ]
  };
}

export default async function CarDetailPage({ searchParams }: { searchParams?: Promise<{ car?: string; trainset?: string }> }) {
  const params = await searchParams;
  const [cars, telemetrySeries, trainsets, insights] = await Promise.all([
    getCarDetails(), 
    getTelemetry(),
    getTrainsets(),
    getInsights()
  ]);
  
  const issueMap = new Map<string, Set<number>>();

  const addIssue = (trainsetId: string, carNumber: number) => {
    if (!issueMap.has(trainsetId)) issueMap.set(trainsetId, new Set<number>());
    issueMap.get(trainsetId)?.add(carNumber);
  };

  cars.forEach((candidate) => {
    if (candidate.healthScore < 80 || candidate.healthStatus === "Alarm" || candidate.healthStatus === "Warning") {
      addIssue(candidate.trainsetId, candidate.carNumber);
    }
  });

  insights.forEach((insight) => {
    if (insight.trainsetId !== "ALL" && insight.severity !== "Normal") {
      addIssue(insight.trainsetId, insight.carNumber);
    }
  });

  const selectedTrainsetId = params?.trainset ?? cars[0]?.trainsetId ?? trainsets[0]?.id ?? "TS-001";
  const selectedTrainset = trainsets.find((trainset) => trainset.id === selectedTrainsetId) ?? trainsets[0];
  const selectedTrainsetIssues = Array.from(issueMap.get(selectedTrainsetId) ?? []).sort((a, b) => a - b);
  const firstKnownCar = cars.find((candidate) => candidate.trainsetId === selectedTrainsetId)?.carNumber;
  const targetCarNumber = params?.car ? parseInt(params.car, 10) : (selectedTrainsetIssues[0] ?? firstKnownCar ?? 1);
  const exactCar = cars.find((candidate) => candidate.trainsetId === selectedTrainsetId && candidate.carNumber === targetCarNumber);
  const selectedInsight = insights.find((insight) => insight.trainsetId === selectedTrainsetId && insight.carNumber === targetCarNumber);
  const car = exactCar ?? buildFallbackCar(selectedTrainsetId, targetCarNumber, selectedInsight?.healthScore ?? selectedTrainset?.healthScore ?? 90);

  const selectedTelemetry = telemetrySeries.find(
    (series) => series.trainsetId === car.trainsetId && series.carNumber === car.carNumber
  );

  const issueTrainsets = trainsets
    .filter((trainset) => issueMap.has(trainset.id) || (trainset.healthStatus !== "Healthy" && trainset.healthStatus !== "Watch"))
    .map((trainset) => trainset.id);
  const issueCarsByTrainset = Object.fromEntries(
    Array.from(issueMap.entries()).map(([trainsetId, carNumbers]) => [trainsetId, Array.from(carNumbers).sort((a, b) => a - b)])
  );

  return (
    <>
      <div className="page-grid">
        <CarSelectorFilter 
          defaultCar={targetCarNumber.toString()} 
          defaultTrainset={selectedTrainsetId}
          trainsets={trainsets.map(t => ({ id: t.id, name: t.name }))}
          issueTrainsets={issueTrainsets}
          issueCarsByTrainset={issueCarsByTrainset}
          totalCarsByTrainset={Object.fromEntries(trainsets.map((trainset) => [trainset.id, trainset.totalCars]))}
        />
        
        <div className="car-detail-summary-grid">
          <CarDetailHeader car={car} />
          <CarHealthSummary car={car} />
        </div>

        <CarDetailInvestigationTabs car={car} telemetry={selectedTelemetry} />
      </div>
    </>
  );
}

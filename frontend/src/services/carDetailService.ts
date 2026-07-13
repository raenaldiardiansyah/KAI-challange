import { carDetailDummy } from "@/dummy/carDetailDummy";
import { trainsetDummy } from "@/dummy/trainsetDummy";
import { insightDummy } from "@/dummy/insightDummy";
import { telemetryDummy } from "@/dummy/telemetryDummy";
import type { CarDetail } from "@/types/car";
import type { Insight } from "@/types/insight";
import type { TelemetrySeries } from "@/types/telemetry";
import type { Trainset } from "@/types/trainset";
import type {
  RamsCarDetailResponse,
  RamsCarHealthResponse,
  RamsConditionMonitoringResponse,
  RamsInsightsResponse,
  RamsSubsystemHealthResponse,
  RamsTrainsetListResponse
} from "@/types/api";
import { adaptCarDetail } from "@/adapters/carAdapter";
import { adaptInsights } from "@/adapters/insightAdapter";
import { getCarIdentity } from "@/adapters/identityAdapter";
import { numericValue, normalizeScore } from "@/adapters/normalizers";
import { adaptHealthStatus, adaptSubsystem } from "@/adapters/statusAdapter";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { getTelemetryData } from "./telemetryService";
import { requestRams, type RamsApiResult } from "./api/ramsApiClient";

export type CarOption = { id: string; label: string; order: number };
export type CarPageData = {
  cars: CarDetail[];
  trainsets: Trainset[];
  insights: Insight[];
  telemetry: TelemetrySeries[];
  carOptionsByTrainset: Record<string, CarOption[]>;
  selectedTrainsetId: string;
  selectedCarId: string;
};

export const carPageDummyData: CarPageData = {
  cars: carDetailDummy,
  trainsets: trainsetDummy,
  insights: insightDummy,
  telemetry: telemetryDummy,
  carOptionsByTrainset: Object.fromEntries(trainsetDummy.map((trainset) => [
    trainset.id,
    Array.from({ length: trainset.totalCars }, (_, index) => ({ id: String(index + 1), label: `Gerbong ${index + 1}`, order: index + 1 }))
  ])),
  selectedTrainsetId: trainsetDummy[0]?.id ?? "TS-001",
  selectedCarId: "1"
};

export async function getCarPageData(
  selection: { trainsetId?: string; carId?: string; subsystem?: string },
  signal?: AbortSignal
): Promise<RamsApiResult<CarPageData>> {
  const [trainResult, insightResult] = await Promise.all([
    requestRams<RamsTrainsetListResponse>("/trainsets", { signal }),
    requestRams<RamsInsightsResponse>("/insights", { signal, query: { limit: 500 } })
  ]);
  const selectedTrain = trainResult.data.trains.find((train) => train.trainset_id === selection.trainsetId)
    ?? trainResult.data.trains[0];
  if (!selectedTrain) throw new Error("Data trainset RAMS belum tersedia.");
  const selectedCarSummary = selectedTrain.cars.find((car) => car.car_id === selection.carId)
    ?? selectedTrain.cars[0];
  if (!selectedCarSummary) throw new Error("Data gerbong RAMS belum tersedia.");

  const subsystem = selection.subsystem && selection.subsystem !== "all" ? selection.subsystem : "PRESSURE";
  const query = { trainset: selectedTrain.trainset_id, car_id: selectedCarSummary.car_id };
  const [detail, carHealth, subsystemHealth, condition, telemetryResult] = await Promise.all([
    requestRams<RamsCarDetailResponse>(`/trainsets/${encodeURIComponent(selectedTrain.trainset_id)}/cars/${encodeURIComponent(selectedCarSummary.car_id)}`, { signal }),
    requestRams<RamsCarHealthResponse>("/frontend/car-health-state", { signal, query }),
    requestRams<RamsSubsystemHealthResponse>("/frontend/subsystem-health-state", { signal, query: { ...query, subsystem } }),
    requestRams<RamsConditionMonitoringResponse>("/frontend/condition-monitoring", { signal, query: { ...query, subsystem } }),
    getTelemetryData({ trainsetId: selectedTrain.trainset_id, carId: selectedCarSummary.car_id, subsystem, limit: 500 }, signal)
  ]);

  const allCars = trainResult.data.trains.flatMap((train) => train.cars.map((car) => adaptCarDetail({
    trainset_id: train.trainset_id,
    car_id: car.car_id,
    subsystems: car.subsystems
  })));
  let selectedCar = adaptCarDetail(detail.data.car);
  const health = carHealth.data.items[0];
  if (health) selectedCar = { ...selectedCar, healthScore: normalizeScore(health.health_score), healthStatus: adaptHealthStatus(health.display_status) };
  const brakePipe = condition.data.signals.brake_pipe?.value;
  const brakeCylinder = condition.data.signals.brake_cylinder?.value;
  selectedCar = {
    ...selectedCar,
    brakePipeBar: numericValue(brakePipe, selectedCar.brakePipeBar),
    brakeCylinderBar: numericValue(brakeCylinder, selectedCar.brakeCylinderBar),
    subsystems: subsystemHealth.data.items.map((item) => ({
      subsystem: adaptSubsystem(item.subsystem_code),
      healthScore: normalizeScore(item.health_score),
      status: adaptHealthStatus(item.display_status),
      evidence: item.reason ?? "Belum tersedia"
    }))
  };
  const selectedIndex = allCars.findIndex((car) => car.id === selectedCar.id && car.trainsetId === selectedCar.trainsetId);
  if (selectedIndex >= 0) allCars[selectedIndex] = selectedCar;
  else allCars.push(selectedCar);

  const results = [trainResult, insightResult, detail, carHealth, subsystemHealth, condition, telemetryResult];
  return {
    data: {
      cars: allCars,
      trainsets: adaptTrainsets(trainResult.data.trains),
      insights: adaptInsights(insightResult.data.items),
      telemetry: telemetryResult.data.series,
      carOptionsByTrainset: Object.fromEntries(trainResult.data.trains.map((train) => [
        train.trainset_id,
        train.cars.map((car) => {
          const identity = getCarIdentity(train.trainset_id, car.car_id);
          return { id: car.car_id, label: `${identity.displayCode} · ${car.car_id}`, order: identity.order };
        })
      ])),
      selectedTrainsetId: selectedTrain.trainset_id,
      selectedCarId: selectedCarSummary.car_id
    },
    source: results.some((result) => result.source === "cache") ? "cache" : "live",
    stale: results.some((result) => result.stale),
    fetchedAt: results.map((result) => result.fetchedAt).sort().at(-1) ?? new Date().toISOString()
  };
}

/** @deprecated Local/Prototype callers should import carDetailDummy directly. */
export async function getCarDetails(): Promise<CarDetail[]> {
  return carDetailDummy;
}

export async function getCarDetail(id: string): Promise<CarDetail | undefined> {
  return carDetailDummy.find((car) => car.id === id);
}

import { carDetailDummy } from "@/dummy/carDetailDummy";
import type { CarDetail } from "@/types/car";
import type { Insight } from "@/types/insight";
import type { TelemetrySeries } from "@/types/telemetry";
import type { Trainset } from "@/types/trainset";
import type {
  RamsCarDetailResponse,
  RamsCarHealthResponse,
  RamsAcSubsystemResponse,
  RamsConditionMonitoringResponse,
  RamsInsightsResponse,
  RamsPressureBrakeResponse,
  RamsSubsystemHealthResponse,
  RamsTrainsetListResponse
} from "@/types/api";
import type { RamsRuleMatchDto, RamsTelemetryDto } from "@/types/api";
import { adaptCarDetail } from "@/adapters/carAdapter";
import { adaptInsights } from "@/adapters/insightAdapter";
import { getCarIdentity, resolveCarId, resolveTrainsetId } from "@/adapters/identityAdapter";
import { numericValue, normalizeScore } from "@/adapters/normalizers";
import { adaptHealthStatus, adaptSubsystem } from "@/adapters/statusAdapter";
import { adaptTrainsets } from "@/adapters/trainsetAdapter";
import { getTelemetryData } from "./telemetryService";
import { safeJsonArray } from "@/lib/safeJson";
import {
  acSubsystemFixture,
  carDetailFixture,
  carHealthFixture,
  conditionMonitoringFixture,
  insightsFixture,
  pressureBrakeFixture,
  subsystemHealthFixture,
  trainsetsFixture
} from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, type RamsApiResult } from "./api/ramsApiClient";

export type CarOption = { id: string; label: string; order: number };
export type CarPageData = {
  cars: CarDetail[];
  trainsets: Trainset[];
  insights: Insight[];
  telemetry: TelemetrySeries[];
  carOptionsByTrainset: Record<string, CarOption[]>;
  selectedTrainsetId: string;
  selectedCarId: string;
  telemetryRecords: RamsTelemetryDto[];
  partialErrors: string[];
};

function adaptRule(rule: RamsRuleMatchDto) {
  return {
    ruleId: rule.rule_id,
    eventCode: rule.event_code,
    level: rule.level,
    condition: rule.condition_expression,
    recommendation: rule.recommendation,
    validationStatus: rule.validation_status ?? null,
    enabled: rule.enabled
  };
}

function errorMessage(reason: unknown, section: string) {
  return `${section}: ${reason instanceof Error ? reason.message : "data belum tersedia"}`;
}

export async function getCarPageData(
  selection: { trainsetId?: string; carId?: string; subsystem?: string },
  signal?: AbortSignal,
  mode: DataMode = "live"
): Promise<RamsApiResult<CarPageData>> {
  const baseSettled = await Promise.allSettled([
    loadRams<RamsTrainsetListResponse>(mode, "/trainsets", trainsetsFixture, { signal }),
    loadRams<RamsInsightsResponse>(mode, "/insights", insightsFixture, { signal, query: { limit: 500 } })
  ]);
  if (baseSettled[0].status === "rejected") throw baseSettled[0].reason;
  const trainResult = baseSettled[0].value;
  const insightResult = baseSettled[1].status === "fulfilled" ? baseSettled[1].value : null;
  const requestedTrainsetId = selection.trainsetId ? resolveTrainsetId(selection.trainsetId) : undefined;
  const selectedTrain = trainResult.data.trains.find((train) => train.trainset_id === requestedTrainsetId)
    ?? trainResult.data.trains[0];
  if (!selectedTrain) throw new Error("Data trainset RAMS belum tersedia.");
  const requestedCarId = selection.carId ? resolveCarId(selectedTrain.trainset_id, selection.carId.startsWith("C") ? selection.carId : `C${selection.carId}`) : undefined;
  const selectedCarSummary = selectedTrain.cars.find((car) => car.car_id === requestedCarId)
    ?? selectedTrain.cars[0];
  if (!selectedCarSummary) throw new Error("Data gerbong RAMS belum tersedia.");

  const subsystemAliases: Record<string, string> = { "Brake System": "PRESSURE", HVAC: "AC", Door: "DOOR", Genset: "GENSET", Speed: "TRACTION", Traction: "TRACTION" };
  const subsystem = selection.subsystem && selection.subsystem !== "all" ? subsystemAliases[selection.subsystem] ?? selection.subsystem : "PRESSURE";
  const query = { trainset: selectedTrain.trainset_id, car_id: selectedCarSummary.car_id };
  const detailSettled = await Promise.allSettled([
    loadRams<RamsCarDetailResponse>(mode, `/trainsets/${encodeURIComponent(selectedTrain.trainset_id)}/cars/${encodeURIComponent(selectedCarSummary.car_id)}`, carDetailFixture(selectedTrain.trainset_id, selectedCarSummary.car_id), { signal }),
    loadRams<RamsCarHealthResponse>(mode, "/frontend/car-health-state", carHealthFixture(selectedTrain.trainset_id, selectedCarSummary.car_id), { signal, query }),
    loadRams<RamsSubsystemHealthResponse>(mode, "/frontend/subsystem-health-state", subsystemHealthFixture(selectedTrain.trainset_id, selectedCarSummary.car_id), { signal, query }),
    subsystem === "PRESSURE"
      ? loadRams<RamsConditionMonitoringResponse>(mode, "/frontend/condition-monitoring", conditionMonitoringFixture(selectedTrain.trainset_id, selectedCarSummary.car_id), { signal, query: { ...query, subsystem } })
      : Promise.resolve(null),
    getTelemetryData({ trainsetId: selectedTrain.trainset_id, carId: selectedCarSummary.car_id, subsystem, limit: 500 }, signal, mode),
    subsystem === "AC"
      ? loadRams<RamsAcSubsystemResponse>(mode, "/frontend/subsystems/ac", acSubsystemFixture, { signal, query: { trainset: selectedTrain.trainset_id, car: selectedCarSummary.car_id } })
      : Promise.resolve(null),
    subsystem === "PRESSURE"
      ? loadRams<RamsPressureBrakeResponse>(mode, "/frontend/subsystems/pressure-brake", pressureBrakeFixture, { signal, query: { trainset: selectedTrain.trainset_id, car: selectedCarSummary.car_id } })
      : Promise.resolve(null)
  ]);

  const detail = detailSettled[0].status === "fulfilled" ? detailSettled[0].value : null;
  const carHealth = detailSettled[1].status === "fulfilled" ? detailSettled[1].value : null;
  const subsystemHealth = detailSettled[2].status === "fulfilled" ? detailSettled[2].value : null;
  const condition = detailSettled[3].status === "fulfilled" ? detailSettled[3].value : null;
  const telemetryResult = detailSettled[4].status === "fulfilled" ? detailSettled[4].value : null;
  const acResult = detailSettled[5].status === "fulfilled" ? detailSettled[5].value : null;
  const pressureResult = detailSettled[6].status === "fulfilled" ? detailSettled[6].value : null;
  const partialErrors = [
    ...(baseSettled[1].status === "rejected" ? [errorMessage(baseSettled[1].reason, "Insight")] : []),
    ...detailSettled.flatMap((result, index) => result.status === "rejected"
      ? [errorMessage(result.reason, ["Detail gerbong", "Car health", "Subsystem health", "Rule evaluation", "Telemetry", "AC subsystem", "Pressure brake"][index])]
      : [])
  ];

  const allCars = trainResult.data.trains.flatMap((train) => train.cars.map((car) => adaptCarDetail({
    trainset_id: train.trainset_id,
    car_id: car.car_id,
    subsystems: car.subsystems
  })));
  let selectedCar = adaptCarDetail(detail?.data.car ?? {
    trainset_id: selectedTrain.trainset_id,
    car_id: selectedCarSummary.car_id,
    subsystems: selectedCarSummary.subsystems
  });
  const health = carHealth?.data.items[0];
  if (health) selectedCar = { ...selectedCar, healthScore: normalizeScore(health.health_score), healthStatus: adaptHealthStatus(health.display_status) };
  const pressureCar = pressureResult?.data.items.flatMap((item) => item.cars).find((item) => item.car === selectedCarSummary.car_id);
  const brakePipe = condition?.data.signals.brake_pipe?.value ?? pressureCar?.bp;
  const brakeCylinder = condition?.data.signals.brake_cylinder?.value ?? pressureCar?.bc;
  const latestBySignal = new Map<string, RamsTelemetryDto>();
  telemetryResult?.data.records.forEach((record) => {
    const current = latestBySignal.get(record.signal_name);
    if (!current || current.event_time < record.event_time) latestBySignal.set(record.signal_name, record);
  });
  const conditionSignals = condition
    ? Object.entries(condition.data.signals).map(([key, value]) => ({
        key,
        label: value.label || key,
        value: value.value,
        unit: value.unit,
        updatedAt: condition.data.generated_at
      }))
    : [];
  const telemetrySignals = Array.from(latestBySignal.values()).map((record) => ({
    key: record.signal_name,
    label: record.signal_name.replaceAll("_", " "),
    value: record.value_float ?? record.value_text ?? record.value,
    unit: record.unit,
    quality: record.quality_status,
    updatedAt: record.event_time
  }));
  const acCar = acResult?.data.items.flatMap((item) => item.cars).find((item) => item.car === selectedCarSummary.car_id);
  const phaseSignals = acCar ? [
    ["voltage", acCar.voltage_value_rst, "V"],
    ["compressor_1_current", acCar.compressor_1_current_value_rst, "A"],
    ["compressor_2_current", acCar.compressor_2_current_value_rst, "A"],
    ["compressor_3_current", acCar.compressor_3_current_value_rst, "A"]
  ].flatMap(([prefix, phases, unit]) => Object.entries(phases as { r: number | null; s: number | null; t: number | null }).map(([phase, value]) => ({ key: `${prefix}_${phase}`, label: `${String(prefix).replaceAll("_", " ")} ${phase.toUpperCase()}`, value, unit: String(unit), updatedAt: acResult?.data.generated_at }))) : [];
  const acSignals = acCar ? [
    { key: "actual_temperature", label: "Actual Temperature", value: acCar.actual_temperature, unit: "C", updatedAt: acResult?.data.generated_at },
    { key: "actual_humidity", label: "Actual Humidity", value: acCar.actual_humidity, unit: "%", updatedAt: acResult?.data.generated_at },
    ...phaseSignals
  ] : [];
  const matchedRules = condition ? safeJsonArray<RamsRuleMatchDto>(condition.data.matched_rules).map(adaptRule) : [];
  const availableRules = condition ? safeJsonArray<RamsRuleMatchDto>(condition.data.available_rules).map(adaptRule) : [];
  const selectedSubsystemHealth = subsystemHealth?.data.items.find((item) => item.subsystem_code === subsystem)
    ?? subsystemHealth?.data.items[0];
  selectedCar = {
    ...selectedCar,
    brakePipeBar: numericValue(brakePipe, selectedCar.brakePipeBar),
    brakeCylinderBar: numericValue(brakeCylinder, selectedCar.brakeCylinderBar),
    hvacTemperature: numericValue(acCar?.actual_temperature, selectedCar.hvacTemperature),
    subsystems: subsystemHealth?.data.items.map((item) => ({
      subsystem: adaptSubsystem(item.subsystem_code),
      healthScore: normalizeScore(item.health_score),
      status: adaptHealthStatus(item.display_status),
      evidence: item.reason ?? "Belum tersedia"
    })) ?? selectedCar.subsystems,
    backendCarId: selectedCarSummary.car_id,
    dataStatus: health?.data_status ?? selectedSubsystemHealth?.data_status ?? null,
    selectedSubsystemCode: subsystem,
    activeAlarmCount: selectedCarSummary.subsystems.reduce((sum, item) => sum + item.active_alarm_count, 0),
    signalCount: selectedCarSummary.subsystems.reduce((sum, item) => sum + (item.signal_count ?? Object.keys(item.latest_values).length), 0),
    criticalSubsystemCount: health?.critical_subsystem_count ?? 0,
    warningSubsystemCount: health?.warning_subsystem_count ?? 0,
    primaryRuleId: condition?.data.health.primary_rule_id ?? selectedSubsystemHealth?.primary_rule_id ?? null,
    primaryEventCode: condition?.data.health.primary_event_code ?? selectedSubsystemHealth?.primary_event_code ?? null,
    healthReason: condition?.data.health.reason ?? selectedSubsystemHealth?.reason ?? null,
    healthSource: selectedSubsystemHealth?.source ?? health?.source ?? null,
    healthUpdatedAt: condition?.data.health.updated_at ?? selectedSubsystemHealth?.updated_at ?? health?.updated_at ?? null,
    sensorValues: acSignals.length ? acSignals : conditionSignals.length ? conditionSignals : telemetrySignals,
    matchedRules,
    availableRules
  };
  const selectedIndex = allCars.findIndex((car) => car.id === selectedCar.id && car.trainsetId === selectedCar.trainsetId);
  if (selectedIndex >= 0) allCars[selectedIndex] = selectedCar;
  else allCars.push(selectedCar);

  const results: RamsApiResult<unknown>[] = [
    trainResult,
    ...(insightResult ? [insightResult] : []),
    ...(detail ? [detail] : []),
    ...(carHealth ? [carHealth] : []),
    ...(subsystemHealth ? [subsystemHealth] : []),
    ...(condition ? [condition] : []),
    ...(telemetryResult ? [telemetryResult] : [])
    ,...(acResult ? [acResult] : [])
    ,...(pressureResult ? [pressureResult] : [])
  ];
  return {
    data: {
      cars: allCars,
      trainsets: adaptTrainsets(trainResult.data.trains),
      insights: adaptInsights(insightResult?.data.items ?? []),
      telemetry: telemetryResult?.data.series ?? [],
      carOptionsByTrainset: Object.fromEntries(trainResult.data.trains.map((train) => [
        train.trainset_id,
        train.cars.map((car) => {
          const identity = getCarIdentity(train.trainset_id, car.car_id);
          return { id: car.car_id, label: `${identity.displayCode} · ${car.car_id}`, order: identity.order };
        })
      ])),
      selectedTrainsetId: selectedTrain.trainset_id,
      selectedCarId: selectedCarSummary.car_id,
      telemetryRecords: telemetryResult?.data.records ?? [],
      partialErrors
    },
    ...mergeRamsMetadata(results)
  };
}

/** @deprecated Local/Prototype callers should import carDetailDummy directly. */
export async function getCarDetails(): Promise<CarDetail[]> {
  return carDetailDummy;
}

export async function getCarDetail(id: string): Promise<CarDetail | undefined> {
  return carDetailDummy.find((car) => car.id === id);
}

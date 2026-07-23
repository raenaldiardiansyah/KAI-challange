import type { RamsAlarmDto, RamsFrontendAlarmDiagnosticDto } from "@/types/api";
import type { Alarm } from "@/types/alarm";
import { getCarIdentity, getTrainsetIdentity } from "./identityAdapter";
import { adaptAlarmStatus, adaptSeverity, adaptSubsystem } from "./statusAdapter";
import { safeJsonValue } from "@/lib/safeJson";

export type AlarmDiagnosticMatch = RamsFrontendAlarmDiagnosticDto & { trainsetId: string; carId: string };

export function adaptAlarm(dto: RamsAlarmDto, diagnostic?: AlarmDiagnosticMatch): Alarm {
  const car = dto.car_id ? getCarIdentity(dto.trainset_id, dto.car_id) : null;
  const trainset = getTrainsetIdentity(dto.trainset_id);
  const parsedEvidence = safeJsonValue(dto.evidence);
  return {
    id: String(dto.id),
    trainsetId: dto.trainset_id,
    trainsetCode: trainset.displayCode,
    carId: dto.car_id,
    carNumber: car?.order ?? 0,
    subsystem: adaptSubsystem(dto.subsystem),
    subsystemCode: dto.subsystem,
    severity: adaptSeverity(dto.severity),
    status: adaptAlarmStatus(dto.status),
    message: dto.description || dto.title,
    detectedAt: dto.first_seen_at ?? "",
    lastUpdate: dto.last_seen_at ?? "",
    title: dto.title,
    signalName: dto.signal_name,
    observedValue: dto.observed_value,
    thresholdValue: dto.threshold_value,
    evidence: parsedEvidence.value,
    recommendation: diagnostic?.recommendation ?? null,
    diagnosticCases: diagnostic?.diagnostic_cases ?? [],
    affectedCars: diagnostic?.affected_cars.map((item) => ({
      carId: item.car_id,
      role: item.role,
      confidence: item.confidence,
      bp: item.bp,
      bc: item.bc
    })) ?? [],
    diagnosticScope: diagnostic?.diagnostic_scope ?? null,
    diagnosticConfidence: diagnostic?.diagnostic_confidence ?? null,
    diagnosticEvidence: diagnostic?.diagnostic_evidence ?? []
  };
}

export function adaptAlarms(items: RamsAlarmDto[], diagnostics: AlarmDiagnosticMatch[] = []) {
  const byContext = new Map(diagnostics.map((item) => [
    `${item.trainsetId}:${item.carId}:${item.subsystem.toUpperCase()}`,
    item
  ]));
  return items
    .filter((item) => ["ACTIVE", "ACKED", "RESOLVED"].includes(item.status.toUpperCase()))
    .map((item) => adaptAlarm(item, item.car_id
      ? byContext.get(`${item.trainset_id}:${item.car_id}:${item.subsystem.toUpperCase()}`)
      : undefined));
}

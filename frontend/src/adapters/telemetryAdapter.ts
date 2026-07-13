import type { RamsTelemetryDto } from "@/types/api";
import type { TelemetryPoint, TelemetrySeries } from "@/types/telemetry";
import { formatTimestamp } from "./normalizers";
import { getCarIdentity, getTrainsetIdentity } from "./identityAdapter";

export type TelemetryRecordView = {
  id: number;
  eventTime: string;
  eventTimeLabel: string;
  trainsetId: string;
  trainsetLabel: string;
  carId: string | null;
  carLabel: string;
  subsystem: string;
  signalName: string;
  displayValue: string;
  value: number | string | null;
  valueFloat: number | null;
  valueText: string | null;
  unit: string | null;
  qualityStatus: string;
  sourceTopic: string | null;
};

export function adaptTelemetryRecord(item: RamsTelemetryDto): TelemetryRecordView {
  const trainset = getTrainsetIdentity(item.trainset_id);
  const car = item.car_id ? getCarIdentity(item.trainset_id, item.car_id) : null;
  const value = item.value_float ?? item.value_text ?? item.value;
  return {
    id: item.id,
    eventTime: item.event_time,
    eventTimeLabel: formatTimestamp(item.event_time),
    trainsetId: item.trainset_id,
    trainsetLabel: trainset.displayCode,
    carId: item.car_id,
    carLabel: car?.displayCode ?? "Kereta",
    subsystem: item.subsystem,
    signalName: item.signal_name,
    displayValue: value === null || value === "" ? "Belum tersedia" : String(value),
    value: item.value,
    valueFloat: item.value_float,
    valueText: item.value_text,
    unit: item.unit,
    qualityStatus: item.quality_status,
    sourceTopic: item.source_topic
  };
}

export function adaptTelemetryRecords(items: RamsTelemetryDto[]) {
  return items.map(adaptTelemetryRecord);
}

export function adaptTelemetry(items: RamsTelemetryDto[]): TelemetrySeries[] {
  const groups = new Map<string, { trainsetId: string; carNumber: number; points: Map<string, TelemetryPoint> }>();

  items.forEach((item) => {
    if (!item.car_id) return;
    const car = getCarIdentity(item.trainset_id, item.car_id);
    const trainset = getTrainsetIdentity(item.trainset_id);
    const groupKey = `${item.trainset_id}:${item.car_id}`;
    const group = groups.get(groupKey) ?? {
      trainsetId: trainset.displayCode,
      carNumber: car.order,
      points: new Map<string, TelemetryPoint>()
    };
    const point = group.points.get(item.event_time) ?? {
      timestamp: item.event_time,
      brakePipeBar: 0,
      brakeCylinderBar: 0,
      temperature: 0,
      gensetVoltage: 0
    };
    const numeric = item.value_float ?? (typeof item.value === "number" ? item.value : 0);
    switch (item.signal_name.toLowerCase()) {
      case "brake_pipe": point.brakePipeBar = numeric; break;
      case "brake_cylinder": point.brakeCylinderBar = numeric; break;
      case "temperature":
      case "cabin_temperature": point.temperature = numeric; break;
      case "genset_voltage": point.gensetVoltage = numeric; break;
    }
    group.points.set(item.event_time, point);
    groups.set(groupKey, group);
  });

  return Array.from(groups.values()).map((group) => ({
    trainsetId: group.trainsetId,
    carNumber: group.carNumber,
    points: Array.from(group.points.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }));
}

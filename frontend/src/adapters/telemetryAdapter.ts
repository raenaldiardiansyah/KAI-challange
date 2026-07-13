import type { RamsTelemetryDto } from "@/types/api";
import type { TelemetryPoint, TelemetrySeries } from "@/types/telemetry";
import { getCarIdentity } from "./identityAdapter";

export function adaptTelemetry(items: RamsTelemetryDto[]): TelemetrySeries[] {
  const groups = new Map<string, { trainsetId: string; carNumber: number; points: Map<string, TelemetryPoint> }>();

  items.forEach((item) => {
    if (!item.car_id) return;
    const car = getCarIdentity(item.trainset_id, item.car_id);
    const groupKey = `${item.trainset_id}:${item.car_id}`;
    const group = groups.get(groupKey) ?? {
      trainsetId: item.trainset_id,
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

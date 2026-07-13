import { telemetryDummy } from "@/dummy/telemetryDummy";
import type { TelemetrySeries } from "@/types/telemetry";
import type { RamsTelemetryDto, RamsTelemetryResponse } from "@/types/api";
import { adaptTelemetry } from "@/adapters/telemetryAdapter";
import { requestRams, type RamsApiResult, type RamsQuery } from "./api/ramsApiClient";

export type TelemetryFilters = {
  trainsetId?: string;
  carId?: string;
  subsystem?: string;
  signalName?: string;
  limit?: number;
};

export type TelemetryData = { series: TelemetrySeries[]; records: RamsTelemetryDto[] };

export const telemetryDummyData: TelemetryData = { series: telemetryDummy, records: [] };

export async function getTelemetryData(filters: TelemetryFilters = {}, signal?: AbortSignal): Promise<RamsApiResult<TelemetryData>> {
  const historyQuery: RamsQuery = {
    trainset_id: filters.trainsetId,
    car_id: filters.carId,
    subsystem: filters.subsystem,
    signal_name: filters.signalName,
    limit: filters.limit ?? 500
  };
  const [latest, history] = await Promise.all([
    requestRams<RamsTelemetryResponse>("/telemetry/latest", { signal, query: { limit: Math.min(filters.limit ?? 100, 1000) } }),
    requestRams<RamsTelemetryResponse>("/telemetry/history", { signal, query: historyQuery })
  ]);
  const byId = new Map<number, RamsTelemetryDto>();
  [...history.data.items, ...latest.data.items].forEach((item) => {
    const matches = (!filters.trainsetId || item.trainset_id === filters.trainsetId)
      && (!filters.carId || item.car_id === filters.carId)
      && (!filters.subsystem || item.subsystem === filters.subsystem)
      && (!filters.signalName || item.signal_name === filters.signalName);
    if (matches) byId.set(item.id, item);
  });
  const records = Array.from(byId.values()).sort((a, b) => a.event_time.localeCompare(b.event_time));
  return {
    data: { records, series: adaptTelemetry(records) },
    source: latest.source === "cache" || history.source === "cache" ? "cache" : "live",
    stale: latest.stale || history.stale,
    fetchedAt: latest.fetchedAt > history.fetchedAt ? latest.fetchedAt : history.fetchedAt
  };
}

/** @deprecated Local/Prototype callers should import telemetryDummy directly. */
export async function getTelemetry(): Promise<TelemetrySeries[]> {
  return telemetryDummy;
}

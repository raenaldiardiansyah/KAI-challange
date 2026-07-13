import { telemetryRamsDummy } from "@/dummy/telemetryRamsDummy";
import { telemetryHistoryFixture, telemetryLatestFixture } from "@/dummy/rams";
import type { TelemetrySeries } from "@/types/telemetry";
import type { RamsTelemetryDto, RamsTelemetryResponse } from "@/types/api";
import { adaptTelemetry } from "@/adapters/telemetryAdapter";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, type RamsApiResult, type RamsQuery } from "./api/ramsApiClient";

export type TelemetryFilters = {
  trainsetId?: string;
  carId?: string;
  subsystem?: string;
  signalName?: string;
  qualityStatus?: string;
  limit?: number;
};

export type TelemetryData = { series: TelemetrySeries[]; records: RamsTelemetryDto[] };

export function filterTelemetryRecords(records: RamsTelemetryDto[], filters: TelemetryFilters = {}) {
  return records.filter((item) => (
    (!filters.trainsetId || item.trainset_id === filters.trainsetId)
    && (!filters.carId || item.car_id === filters.carId)
    && (!filters.subsystem || item.subsystem === filters.subsystem)
    && (!filters.signalName || item.signal_name === filters.signalName)
    && (!filters.qualityStatus || item.quality_status === filters.qualityStatus)
  ));
}

export const telemetryDummyData: TelemetryData = {
  records: telemetryRamsDummy,
  series: adaptTelemetry(telemetryRamsDummy)
};

export async function getTelemetryData(filters: TelemetryFilters = {}, signal?: AbortSignal, mode: DataMode = "live"): Promise<RamsApiResult<TelemetryData>> {
  const historyQuery: RamsQuery = {
    trainset_id: filters.trainsetId,
    car_id: filters.carId,
    subsystem: filters.subsystem,
    signal_name: filters.signalName,
    limit: filters.limit ?? 500
  };
  const settled = await Promise.allSettled([
    loadRams<RamsTelemetryResponse>(mode, "/telemetry/latest", telemetryLatestFixture, { signal, query: { limit: Math.min(filters.limit ?? 100, 1000) } }),
    loadRams<RamsTelemetryResponse>(mode, "/telemetry/history", telemetryHistoryFixture, { signal, query: historyQuery })
  ]);
  const fulfilled = settled
    .filter((result): result is PromiseFulfilledResult<RamsApiResult<RamsTelemetryResponse>> => result.status === "fulfilled")
    .map((result) => result.value);
  if (fulfilled.length === 0) {
    const rejected = settled.find((result): result is PromiseRejectedResult => result.status === "rejected");
    throw rejected?.reason ?? new Error("Data telemetry RAMS belum tersedia.");
  }
  const byId = new Map<number, RamsTelemetryDto>();
  fulfilled.flatMap((result) => result.data.items).forEach((item) => byId.set(item.id, item));
  const records = filterTelemetryRecords(Array.from(byId.values()), filters)
    .sort((a, b) => a.event_time.localeCompare(b.event_time));
  return {
    data: { records, series: adaptTelemetry(records) },
    ...mergeRamsMetadata(fulfilled)
  };
}

/** @deprecated Local/Prototype callers should import telemetryDummy directly. */
export async function getTelemetry(): Promise<TelemetrySeries[]> {
  return telemetryDummyData.series;
}

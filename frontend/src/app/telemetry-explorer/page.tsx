"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TelemetryFilter } from "@/features/telemetry/TelemetryFilter";
import { TelemetryChart } from "@/features/telemetry/TelemetryChart";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";
import { getTelemetryData, type TelemetryData, type TelemetryFilters } from "@/services/telemetryService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";
import { DataFreshnessLabel } from "@/components/data/DataFreshnessLabel";
import { adaptTelemetry, adaptTelemetryRecords } from "@/adapters/telemetryAdapter";
import { filterTelemetryRecords } from "@/services/telemetryService";
import { getCarIdentity, getTrainsetIdentity, resolveCarId, resolveTrainsetId } from "@/adapters/identityAdapter";
import { adaptSubsystem } from "@/adapters/statusAdapter";
import type { RamsTelemetryDto } from "@/types/api";

const EMPTY_RECORDS: RamsTelemetryDto[] = [];

function uniqueFacets(values: Array<{ value: string; label?: string }>) {
  return Array.from(new Map(values.map((item) => [item.value, { value: item.value, label: item.label ?? item.value }])).values())
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function TelemetryExplorerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TelemetryFilters>(() => {
    const trainsetQuery = searchParams.get("trainset") ?? undefined;
    const trainsetId = trainsetQuery ? resolveTrainsetId(trainsetQuery) : undefined;
    const carQuery = searchParams.get("car") ?? undefined;
    const subsystemQuery = searchParams.get("subsystem") ?? undefined;
    const subsystemAliases: Record<string, string> = {
      "Brake System": "PRESSURE", Door: "DOOR", HVAC: "AC", Genset: "GENSET", Speed: "TRACTION", Traction: "TRACTION"
    };
    return {
      limit: 500,
      trainsetId,
      carId: carQuery && trainsetId ? resolveCarId(trainsetId, carQuery) : carQuery,
      subsystem: subsystemQuery ? subsystemAliases[subsystemQuery] ?? subsystemQuery : undefined,
      signalName: searchParams.get("signal") ?? undefined,
      qualityStatus: searchParams.get("quality") ?? undefined
    };
  });
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getTelemetryData(filters, signal, mode), [filters]);
  const resource = useRamsResource<TelemetryData>(loader, 30_000);
  const handleFilterChange = (next: TelemetryFilters) => {
    setFilters(next);
    const params = new URLSearchParams();
    if (next.trainsetId) params.set("trainset", getTrainsetIdentity(next.trainsetId).displayCode);
    if (next.carId) params.set("car", getCarIdentity(next.trainsetId ?? "", next.carId).displayCode);
    if (next.subsystem) params.set("subsystem", adaptSubsystem(next.subsystem));
    if (next.signalName) params.set("signal", next.signalName);
    if (next.qualityStatus) params.set("quality", next.qualityStatus);
    router.replace(params.size ? `?${params.toString()}` : "/telemetry-explorer", { scroll: false });
  };

  const records = resource.data?.records ?? EMPTY_RECORDS;
  const facets = useMemo(() => ({
    trainsets: uniqueFacets(records.map((item) => ({ value: item.trainset_id, label: getTrainsetIdentity(item.trainset_id).displayCode }))),
    cars: uniqueFacets(records.filter((item) => item.car_id).map((item) => ({ value: item.car_id!, label: getCarIdentity(item.trainset_id, item.car_id!).displayCode }))),
    subsystems: uniqueFacets(records.map((item) => ({ value: item.subsystem, label: adaptSubsystem(item.subsystem) }))),
    signals: uniqueFacets(records.map((item) => ({ value: item.signal_name }))),
    qualities: uniqueFacets(records.map((item) => ({ value: item.quality_status })))
  }), [records]);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data) return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;

  const filteredRecords = filterTelemetryRecords(records, filters);
  const recordViews = adaptTelemetryRecords(filteredRecords);
  const pressureRecords = filteredRecords.filter((item) => ["brake_pipe", "brake_cylinder"].includes(item.signal_name.toLowerCase()));
  const selectedSeries = adaptTelemetry(pressureRecords)[0];

  return (
    <div className="page-grid telemetry-explorer-layout">
      <section>
        <TelemetryFilter filters={filters} facets={facets} total={records.length} filtered={filteredRecords.length} onChange={handleFilterChange} />
      </section>

      <DataFreshnessLabel source={resource.source} stale={resource.stale} fromCache={resource.fromCache} generatedAt={resource.generatedAt} fetchedAt={resource.fetchedAt} error={resource.error} />
      
      {selectedSeries ? (
        <section className="telemetry-chart-panel">
          <TelemetryChart series={selectedSeries} />
        </section>
      ) : null}

      <section>
        <TelemetryTable records={recordViews} />
      </section>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { TelemetryFilter } from "@/features/telemetry/TelemetryFilter";
import { TelemetryChart } from "@/features/telemetry/TelemetryChart";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";
import { getTelemetryData, telemetryDummyData, type TelemetryData, type TelemetryFilters } from "@/services/telemetryService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function TelemetryExplorerPage() {
  const [filters, setFilters] = useState<TelemetryFilters>({ limit: 500 });
  const loader = useCallback((signal: AbortSignal) => getTelemetryData(filters, signal), [filters]);
  const resource = useRamsResource<TelemetryData>(telemetryDummyData, loader, 30_000);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data) return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;
  const selectedSeries = resource.data.series[0];

  return (
    <div className="page-grid telemetry-explorer-layout">
      <section>
        <TelemetryFilter filters={filters} onChange={setFilters} />
      </section>
      
      {selectedSeries ? (
        <section className="telemetry-chart-panel">
          <TelemetryChart series={selectedSeries} />
        </section>
      ) : null}

      <section>
        <TelemetryTable series={selectedSeries} />
      </section>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { ActiveAlarmTable } from "@/features/overview/ActiveAlarmTable";
import { PredictiveMaintenancePanel } from "@/features/overview/PredictiveMaintenancePanel";
import { InteractiveTrainsetPanel } from "@/features/overview/InteractiveTrainsetPanel";
import { SummaryCards } from "@/features/overview/SummaryCards";
import { TrainPositionMap } from "@/features/overview/TrainPositionMap";
import { getOverviewData, type OverviewData } from "@/services/overviewService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function OverviewPage() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getOverviewData(signal, mode), []);
  const resource = useRamsResource<OverviewData>(loader, 15_000);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.carInsights.length === 0) {
    return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;
  }
  const data = resource.data;

  return (
    <>
      <div className="page-grid overview-compact-layout overview-page">
        <section className="overview-top-grid">
          <InteractiveTrainsetPanel compositions={data.trainsetCompositions} />
          <TrainPositionMap points={data.mapPoints} />
        </section>

        <section className="overview-row-2">
          <SummaryCards summary={data.summary} />
        </section>

        <section className="overview-bottom-grid">
          <ActiveAlarmTable alarms={data.alarms} />
          <PredictiveMaintenancePanel risks={data.maintenance} insights={data.insights} />
        </section>
      </div>
    </>
  );
}

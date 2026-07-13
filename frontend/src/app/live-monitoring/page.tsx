"use client";

import { useCallback } from "react";
import { LiveMonitoringWorkspace } from "@/features/live-monitoring/LiveMonitoringWorkspace";
import { overviewDummy } from "@/dummy/overviewDummy";
import { getLiveMonitoringData, type LiveMonitoringData } from "@/services/mapService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

const dummyData: LiveMonitoringData = {
  points: overviewDummy.mapPoints,
  trainsets: overviewDummy.trainsets
};

export default function LiveMonitoringPage() {
  const loader = useCallback((signal: AbortSignal) => getLiveMonitoringData(signal), []);
  const resource = useRamsResource<LiveMonitoringData>(dummyData, loader, 10_000);
  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.points.length === 0) {
    return <DataUnavailableState message={resource.error ?? "Posisi RAMS belum tersedia."} onRetry={resource.retry} />;
  }
  return <LiveMonitoringWorkspace points={resource.data.points} trainsets={resource.data.trainsets} />;
}

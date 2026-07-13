"use client";

import { useCallback } from "react";
import { PredictiveMaintenanceWorkspace } from "@/features/predictive-maintenance/PredictiveMaintenanceWorkspace";
import { getMaintenanceRisks, maintenanceDummy } from "@/services/maintenanceService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function PredictiveMaintenancePage() {
  const loader = useCallback((signal: AbortSignal) => getMaintenanceRisks(signal), []);
  const resource = useRamsResource(maintenanceDummy, loader);
  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.length === 0) {
    return <DataUnavailableState message={resource.error ?? "Data prediktif RAMS belum tersedia."} onRetry={resource.retry} />;
  }
  return <PredictiveMaintenanceWorkspace risks={resource.data} prototypeFields={resource.source !== "dummy"} />;
}

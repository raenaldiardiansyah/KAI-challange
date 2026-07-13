"use client";

import { useCallback } from "react";
import { PredictiveMaintenanceWorkspace } from "@/features/predictive-maintenance/PredictiveMaintenanceWorkspace";
import { getMaintenanceRisks, refreshMaintenanceRisks } from "@/services/maintenanceService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";

export default function PredictiveMaintenancePage() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getMaintenanceRisks(signal, mode), []);
  const resource = useRamsResource(loader);
  const { user } = useCurrentUser();
  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.length === 0) {
    return <DataUnavailableState message={resource.error ?? "Data prediktif RAMS belum tersedia."} onRetry={resource.retry} />;
  }
  const refresh = resource.source === "live" && hasPermission(user?.role, "refresh_analytics")
    ? async () => { await refreshMaintenanceRisks(); resource.retry(); }
    : undefined;
  return <PredictiveMaintenanceWorkspace risks={resource.data} prototypeFields={resource.source !== "dummy"} onRefresh={refresh} />;
}

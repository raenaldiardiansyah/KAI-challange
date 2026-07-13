"use client";

import { useCallback } from "react";
import { InsightWorkspace } from "@/features/insight/InsightWorkspace";
import { getInsights, refreshInsights } from "@/services/insightService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";

export default function InsightAnalyticPage() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getInsights(signal, mode), []);
  const resource = useRamsResource(loader);
  const { user } = useCurrentUser();
  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.length === 0) {
    return <DataUnavailableState message={resource.error ?? "Insight RAMS belum tersedia."} onRetry={resource.retry} />;
  }
  const refresh = resource.source === "live" && hasPermission(user?.role, "refresh_analytics")
    ? async () => { await refreshInsights(); resource.retry(); }
    : undefined;
  return <InsightWorkspace insights={resource.data} isDummy={resource.source === "dummy"} onRefresh={refresh} />;
}

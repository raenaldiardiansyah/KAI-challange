"use client";

import { useCallback } from "react";
import { InsightWorkspace } from "@/features/insight/InsightWorkspace";
import { getInsights, insightDummy } from "@/services/insightService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function InsightAnalyticPage() {
  const loader = useCallback((signal: AbortSignal) => getInsights(signal), []);
  const resource = useRamsResource(insightDummy, loader);
  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.length === 0) {
    return <DataUnavailableState message={resource.error ?? "Insight RAMS belum tersedia."} onRetry={resource.retry} />;
  }
  return <InsightWorkspace insights={resource.data} />;
}

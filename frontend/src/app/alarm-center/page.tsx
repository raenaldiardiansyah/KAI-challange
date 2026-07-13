"use client";

import { useCallback } from "react";
import { AlarmCenterWorkspace } from "@/features/alarm/AlarmCenterWorkspace";
import { acknowledgeAlarm, getAlarms, resolveAlarm } from "@/services/alarmService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function AlarmCenterPage() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getAlarms(signal, mode), []);
  const resource = useRamsResource(loader, 15_000);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data) return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlarm(id);
    resource.retry();
  };
  const handleResolve = async (id: string) => {
    await resolveAlarm(id);
    resource.retry();
  };

  return (
    <AlarmCenterWorkspace
      alarms={resource.data}
      isDummy={resource.source === "dummy"}
      onAcknowledge={handleAcknowledge}
      onResolve={handleResolve}
    />
  );
}

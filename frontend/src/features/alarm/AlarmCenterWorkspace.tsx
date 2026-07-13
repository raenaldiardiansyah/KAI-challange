"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlarmDetail } from "./AlarmDetail";
import { AlarmFilter } from "./AlarmFilter";
import { AlarmSummary } from "./AlarmSummary";
import { AlarmTable } from "./AlarmTable";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus, Severity, SubsystemName } from "@/types/common";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function isAlarmMatch(alarm: Alarm, query: string) {
  if (!query) return true;
  const searchable = [
    alarm.id,
    alarm.trainsetId,
    `C${alarm.carNumber}`,
    `Gerbong ${alarm.carNumber}`,
    alarm.subsystem,
    alarm.severity,
    alarm.status,
    alarm.message
  ].join(" ");

  return normalize(searchable).includes(query);
}

export function AlarmCenterWorkspace({
  alarms,
  isDummy,
  onAcknowledge,
  onResolve
}: {
  alarms: Alarm[];
  isDummy: boolean;
  onAcknowledge?: (id: string) => Promise<void>;
  onResolve?: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const canMutateAlarm = isDummy || hasPermission(user?.role, "maintenance_action");
  const initialCar = searchParams.get("car");
  const [query, setQuery] = useState(initialCar ? `C${initialCar.replace(/^C/i, "")}` : "");
  const [selectedId, setSelectedId] = useState(searchParams.get("alarm") ?? alarms[0]?.id ?? "");
  const [trainsetFilter, setTrainsetFilter] = useState(searchParams.get("trainset") ?? "all");
  const [subsystemFilter, setSubsystemFilter] = useState<"all" | SubsystemName>((searchParams.get("subsystem") as SubsystemName | null) ?? "all");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>((searchParams.get("severity") as Severity | null) ?? "all");
  const [statusFilter, setStatusFilter] = useState<"all" | AlarmStatus>((searchParams.get("status") as AlarmStatus | null) ?? "all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AlarmStatus>>({});
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const normalizedQuery = normalize(query);

  const alarmsWithOverrides = useMemo(
    () => alarms.map((alarm) => ({ ...alarm, status: statusOverrides[alarm.id] ?? alarm.status })),
    [alarms, statusOverrides]
  );

  const filteredAlarms = useMemo(
    () => alarmsWithOverrides.filter((alarm) => {
      return (
        isAlarmMatch(alarm, normalizedQuery) &&
        (trainsetFilter === "all" || alarm.trainsetId === trainsetFilter) &&
        (subsystemFilter === "all" || alarm.subsystem === subsystemFilter) &&
        (severityFilter === "all" || alarm.severity === severityFilter) &&
        (statusFilter === "all" || alarm.status === statusFilter)
      );
    }),
    [alarmsWithOverrides, normalizedQuery, severityFilter, statusFilter, subsystemFilter, trainsetFilter]
  );

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return alarmsWithOverrides
      .filter((alarm) => isAlarmMatch(alarm, normalizedQuery))
      .slice(0, 5);
  }, [alarmsWithOverrides, normalizedQuery]);

  const selectedAlarm = alarmsWithOverrides.find((alarm) => alarm.id === selectedId)
    ?? filteredAlarms[0]
    ?? alarmsWithOverrides[0];

  const handleSuggestionClick = (alarm: Alarm) => {
    setQuery(`${alarm.trainsetId} ${alarm.subsystem}`);
    handleSelect(alarm.id);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("alarm", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleAcknowledge = async (id: string) => {
    setActionError(null);
    if (isDummy) {
      setStatusOverrides((current) => ({ ...current, [id]: "Acknowledged" }));
      handleSelect(id);
      return;
    }
    setMutatingId(id);
    try {
      await onAcknowledge?.(id);
      handleSelect(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Acknowledge alarm gagal.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setActionError(null);
    if (isDummy) {
      setStatusOverrides((current) => ({ ...current, [id]: "Closed" }));
      return;
    }
    setMutatingId(id);
    try {
      await onResolve?.(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Resolve alarm gagal.");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="page-grid alarm-inbox-layout">
      {(trainsetFilter !== "all" || initialCar || subsystemFilter !== "all") ? <div className="alarm-context-bar">
        <strong>Konteks:</strong> {trainsetFilter !== "all" ? trainsetFilter : "Semua trainset"}{initialCar ? ` · C${initialCar.replace(/^C/i, "")}` : ""}{subsystemFilter !== "all" ? ` · ${subsystemFilter}` : ""}
      </div> : null}
      <section className="alarm-summary-strip">
        <AlarmSummary alarms={filteredAlarms} />
      </section>

      <aside className="alarm-filter-panel">
        <AlarmFilter
          query={query}
          suggestions={suggestions}
          trainsetFilter={trainsetFilter}
          subsystemFilter={subsystemFilter}
          severityFilter={severityFilter}
          statusFilter={statusFilter}
          onQueryChange={setQuery}
          onSuggestionClick={handleSuggestionClick}
          onTrainsetFilterChange={setTrainsetFilter}
          onSubsystemFilterChange={setSubsystemFilter}
          onSeverityFilterChange={setSeverityFilter}
          onStatusFilterChange={setStatusFilter}
        />
        {actionError ? <p role="alert" className="empty-state">{actionError}</p> : null}
        {selectedAlarm ? <AlarmDetail alarm={selectedAlarm} onResolve={canMutateAlarm ? handleResolve : undefined} resolving={mutatingId === selectedAlarm.id} /> : null}
      </aside>

      <section className="alarm-table-panel">
        <AlarmTable alarms={filteredAlarms} onAcknowledge={canMutateAlarm ? handleAcknowledge : undefined} onSelectAlarm={handleSelect} selectedAlarmId={selectedAlarm?.id} acknowledgingId={mutatingId} />
      </section>
    </div>
  );
}

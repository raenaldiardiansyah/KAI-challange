"use client";

import { useMemo, useState } from "react";
import { AlarmDetail } from "./AlarmDetail";
import { AlarmFilter } from "./AlarmFilter";
import { AlarmSummary } from "./AlarmSummary";
import { AlarmTable } from "./AlarmTable";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus, Severity, SubsystemName } from "@/types/common";

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

export function AlarmCenterWorkspace({ alarms }: { alarms: Alarm[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(alarms[0]?.id ?? "");
  const [trainsetFilter, setTrainsetFilter] = useState("all");
  const [subsystemFilter, setSubsystemFilter] = useState<"all" | SubsystemName>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AlarmStatus>("all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AlarmStatus>>({});
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
    setSelectedId(alarm.id);
  };

  const handleAcknowledge = (id: string) => {
    setStatusOverrides((current) => ({ ...current, [id]: "Acknowledged" }));
    setSelectedId(id);
  };

  return (
    <div className="page-grid alarm-inbox-layout">
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
        {selectedAlarm ? <AlarmDetail alarm={selectedAlarm} /> : null}
      </aside>

      <section className="alarm-table-panel">
        <AlarmTable alarms={filteredAlarms} onAcknowledge={handleAcknowledge} onSelectAlarm={setSelectedId} selectedAlarmId={selectedAlarm?.id} />
      </section>
    </div>
  );
}

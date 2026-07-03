"use client";

import { useMemo, useState } from "react";
import { AlarmDetail } from "./AlarmDetail";
import { AlarmFilter } from "./AlarmFilter";
import { AlarmSummary } from "./AlarmSummary";
import { AlarmTable } from "./AlarmTable";
import type { Alarm } from "@/types/alarm";

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
  const normalizedQuery = normalize(query);

  const filteredAlarms = useMemo(
    () => alarms.filter((alarm) => isAlarmMatch(alarm, normalizedQuery)),
    [alarms, normalizedQuery]
  );

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return alarms
      .filter((alarm) => isAlarmMatch(alarm, normalizedQuery))
      .slice(0, 5);
  }, [alarms, normalizedQuery]);

  const selectedAlarm = alarms.find((alarm) => alarm.id === selectedId)
    ?? filteredAlarms[0]
    ?? alarms[0];

  const handleSuggestionClick = (alarm: Alarm) => {
    setQuery(`${alarm.trainsetId} ${alarm.subsystem}`);
    setSelectedId(alarm.id);
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
          onQueryChange={setQuery}
          onSuggestionClick={handleSuggestionClick}
        />
        {selectedAlarm ? <AlarmDetail alarm={selectedAlarm} /> : null}
      </aside>

      <section className="alarm-table-panel">
        <AlarmTable alarms={filteredAlarms} onSelectAlarm={setSelectedId} selectedAlarmId={selectedAlarm?.id} />
      </section>
    </div>
  );
}

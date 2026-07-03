"use client";

import { useState, useMemo } from "react";
import type { Alarm } from "@/types/alarm";
import type { Trainset } from "@/types/trainset";
import type { TelemetrySeries } from "@/types/telemetry";
import type { ReportFilterValues } from "@/types/reportFilter";
import { DEFAULT_FILTER, SUBSYSTEM_KEY_MAP } from "@/types/reportFilter";
import { ReportFilter } from "./ReportFilter";
import { ReportSummary } from "./ReportSummary";
import { ReportTrendChart } from "./ReportTrendChart";
import { TelemetryReportChart } from "./TelemetryReportChart";
import { ReportTable } from "./ReportTable";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";

type ReportPageClientProps = {
  alarms: Alarm[];
  trainsets: Trainset[];
  telemetry: TelemetrySeries[];
};

/**
 * Client-side wrapper for the Report Analytics page.
 * Owns the filter state and passes filtered data down to all child components.
 */
export function ReportPageClient({ alarms, trainsets, telemetry }: ReportPageClientProps) {
  const [filter, setFilter] = useState<ReportFilterValues>(DEFAULT_FILTER);

  // ── Pre-filter alarms by period for summary component ───────
  const filteredAlarms = useMemo(() => {
    const now = new Date();
    const start = periodStart(filter.period, now);

    return alarms.filter((alarm) => {
      const dt = new Date(alarm.detectedAt);
      if (dt < start) return false;
      if (filter.trainsetId !== "all_ts" && alarm.trainsetId !== filter.trainsetId) return false;
      if (filter.subsystem !== "all_sub") {
        const subsystemName = SUBSYSTEM_KEY_MAP[filter.subsystem];
        if (subsystemName && alarm.subsystem !== subsystemName) return false;
      }
      return true;
    });
  }, [alarms, filter]);

  return (
    <div className="page-grid report-center-layout">
      <section>
        <ReportFilter values={filter} onChange={setFilter} trainsets={trainsets} />
      </section>

      <section>
        <ReportSummary alarms={filteredAlarms} trainsets={trainsets} filter={filter} />
      </section>

      <section className="report-chart-grid">
        <ReportTrendChart alarms={alarms} filter={filter} />
        <TelemetryReportChart series={telemetry} filter={filter} />
      </section>

      <section>
        <ReportTable filter={filter} />
      </section>

      <section>
        <TelemetryTable />
      </section>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────
function periodStart(period: ReportFilterValues["period"], now: Date): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case "today":
      return start;
    case "week":
      start.setDate(start.getDate() - 7);
      return start;
    case "month":
      start.setDate(start.getDate() - 30);
      return start;
    case "year":
      return new Date(start.getFullYear(), 0, 1);
  }
}

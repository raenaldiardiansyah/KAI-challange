"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import type { Alarm } from "@/types/alarm";
import type { Trainset } from "@/types/trainset";
import type { ReportFilterValues } from "@/types/reportFilter";
import { PERIOD_LABELS } from "@/types/reportFilter";

type ReportSummaryProps = {
  alarms: Alarm[];
  trainsets: Trainset[];
  filter: ReportFilterValues;
};

export function ReportSummary({ alarms, trainsets, filter }: ReportSummaryProps) {
  const periodLabel = PERIOD_LABELS[filter.period];

  const filteredTrainsets = useMemo(
    () =>
      filter.trainsetId === "all_ts"
        ? trainsets
        : trainsets.filter((t) => t.id === filter.trainsetId),
    [trainsets, filter.trainsetId],
  );

  const avgHealth = useMemo(() => {
    if (filteredTrainsets.length === 0) return 0;
    const total = filteredTrainsets.reduce((sum, t) => sum + t.healthScore, 0);
    return Math.round(total / filteredTrainsets.length);
  }, [filteredTrainsets]);

  const criticalCount = useMemo(
    () =>
      alarms.filter(
        (a) => a.severity === "High" || a.severity === "Critical",
      ).length,
    [alarms],
  );

  const dataAvailability = useMemo(() => {
    if (filteredTrainsets.length === 0) return 0;
    const onlineCount = filteredTrainsets.filter(
      (t) => t.dataStatus === "Online",
    ).length;
    return Math.round((onlineCount / filteredTrainsets.length) * 100);
  }, [filteredTrainsets]);

  const closedCount = useMemo(
    () =>
      alarms.filter(
        (a) => a.status === "Closed" || a.status === "Auto Cleared",
      ).length,
    [alarms],
  );

  return (
    <div className="summary-grid">
      <Card>
        <div className="metric-card">
          <span style={{ background: "#d1fae5", color: "#059669" }}>
            {avgHealth}%
          </span>
          <div>
            <strong>Rata-Rata Kesehatan</strong>
            <p>Armada KAI {periodLabel}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#fee2e2", color: "#b91c1c" }}>
            {criticalCount}
          </span>
          <div>
            <strong>Total Insiden Kritis</strong>
            <p>Insiden {periodLabel}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#fef3c7", color: "#d97706" }}>
            {dataAvailability}%
          </span>
          <div>
            <strong>Ketersediaan Data</strong>
            <p>Uptime sistem telemetri {periodLabel}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            {closedCount}
          </span>
          <div>
            <strong>SPK Diselesaikan</strong>
            <p>Diselesaikan {periodLabel}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

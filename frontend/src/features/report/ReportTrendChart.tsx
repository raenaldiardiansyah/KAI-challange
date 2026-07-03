"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Alarm } from "@/types/alarm";
import type { ReportFilterValues } from "@/types/reportFilter";
import { PERIOD_LABELS, SUBSYSTEM_KEY_MAP } from "@/types/reportFilter";

type ChartMode = "total" | "critical" | "warning";

type ReportTrendChartProps = {
  alarms: Alarm[];
  filter: ReportFilterValues;
};

/** Return the start-of-day Date for a period filter relative to `now`. */
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

/** Format a Date to short label like "Jul 3" */
function shortDateLabel(d: Date): string {
  return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
}

const PERIOD_SUBTITLES: Record<ReportFilterValues["period"], string> = {
  today: "Total insiden alarm hari ini",
  week: "Total insiden alarm 7 hari terakhir",
  month: "Total insiden alarm 30 hari terakhir",
  year: "Total insiden alarm tahun ini",
};

const PERIOD_TITLES: Record<ReportFilterValues["period"], string> = {
  today: "Insiden Hari Ini",
  week: "Insiden Mingguan",
  month: "Insiden Bulanan",
  year: "Insiden Tahunan",
};

export function ReportTrendChart({ alarms, filter }: ReportTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>("total");

  // ── Filter alarms by period, trainset, subsystem ────────────
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

  // ── Group by date → chart data ──────────────────────────────
  const chartData = useMemo(() => {
    const map = new Map<string, { dateObj: Date; critical: number; warning: number }>();

    for (const alarm of filteredAlarms) {
      const dt = new Date(alarm.detectedAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      if (!map.has(key)) {
        map.set(key, { dateObj: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()), critical: 0, warning: 0 });
      }
      const entry = map.get(key)!;
      if (alarm.severity === "High" || alarm.severity === "Critical") {
        entry.critical++;
      } else {
        entry.warning++;
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((entry) => ({
        date: shortDateLabel(entry.dateObj),
        critical: entry.critical,
        warning: entry.warning,
      }));
  }, [filteredAlarms]);

  // ── Totals ──────────────────────────────────────────────────
  const totals = useMemo(() => {
    const critical = chartData.reduce((sum, p) => sum + p.critical, 0);
    const warning = chartData.reduce((sum, p) => sum + p.warning, 0);
    return { critical, warning, total: critical + warning };
  }, [chartData]);

  // ── Y-axis max ──────────────────────────────────────────────
  const yAxisMax = useMemo(() => {
    const maxValue = chartData.reduce((max, point) => {
      if (mode === "critical") return Math.max(max, point.critical);
      if (mode === "warning") return Math.max(max, point.warning);
      return Math.max(max, point.critical, point.warning);
    }, 0);
    return Math.max(4, Math.ceil((maxValue + 1) / 2) * 2);
  }, [chartData, mode]);

  return (
    <Card className="report-interactive-chart-card">
      <div className="report-interactive-chart-header">
        <div className="report-interactive-chart-title">
          <h2>{PERIOD_TITLES[filter.period]}</h2>
          <p>{PERIOD_SUBTITLES[filter.period]}</p>
        </div>
        <button
          className={mode === "total" ? "report-interactive-chart-metric active" : "report-interactive-chart-metric"}
          type="button"
          onClick={() => setMode("total")}
        >
          <span>Total</span>
          <strong>{totals.total.toLocaleString("id-ID")}</strong>
        </button>
        <button
          className={mode === "critical" ? "report-interactive-chart-metric active" : "report-interactive-chart-metric"}
          type="button"
          onClick={() => setMode("critical")}
        >
          <span>Kritis</span>
          <strong>{totals.critical.toLocaleString("id-ID")}</strong>
        </button>
        <button
          className={mode === "warning" ? "report-interactive-chart-metric active" : "report-interactive-chart-metric"}
          type="button"
          onClick={() => setMode("warning")}
        >
          <span>Waspada</span>
          <strong>{totals.warning.toLocaleString("id-ID")}</strong>
        </button>
      </div>

      <div className="report-interactive-chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 18, right: 8, left: -28, bottom: 0 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval={chartData.length > 10 ? 3 : 0}
              tick={{ fontSize: 12, fill: "#8f96a3" }}
              tickMargin={10}
            />
            <YAxis hide domain={[0, yAxisMax]} />
            <Tooltip
              cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #d8e0e7",
                borderRadius: "8px",
                color: "#17202a",
                fontSize: "12px"
              }}
              formatter={(value, name) => [`${value} insiden`, name === "critical" ? "Kritis" : "Waspada"]}
              labelStyle={{ color: "#64748b" }}
            />
            {mode !== "warning" ? <Bar dataKey="critical" fill="#ef4444" radius={[3, 3, 0, 0]} /> : null}
            {mode !== "critical" ? <Bar dataKey="warning" fill="#f59e0b" radius={[3, 3, 0, 0]} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

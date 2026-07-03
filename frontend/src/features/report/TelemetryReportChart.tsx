"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { TelemetrySeries } from "@/types/telemetry";
import type { ReportFilterValues } from "@/types/reportFilter";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TelemetryReportChart({ series, filter }: { series: TelemetrySeries[]; filter: ReportFilterValues }) {
  const filteredSeries = useMemo(() => {
    if (filter.trainsetId === "all_ts") return series;
    return series.filter((item) => item.trainsetId === filter.trainsetId);
  }, [series, filter.trainsetId]);

  const [selectedKey, setSelectedKey] = useState(() => {
    const first = filteredSeries[0];
    return first ? `${first.trainsetId}-${first.carNumber}` : "";
  });

  useEffect(() => {
    const first = filteredSeries[0];
    setSelectedKey(first ? `${first.trainsetId}-${first.carNumber}` : "");
  }, [filteredSeries]);

  const selectedSeries = useMemo(() => {
    return filteredSeries.find((item) => `${item.trainsetId}-${item.carNumber}` === selectedKey) ?? filteredSeries[0];
  }, [selectedKey, filteredSeries]);

  if (filteredSeries.length === 0) {
    return <Card title="Ringkasan Telemetri Sensor"><p>Tidak ada data telemetri untuk armada yang dipilih</p></Card>;
  }

  if (!selectedSeries) return null;

  const data = selectedSeries.points.map((point) => ({
    time: point.timestamp,
    "Brake Pipe": point.brakePipeBar,
    "Brake Cylinder": point.brakeCylinderBar,
    "Median Brake Cylinder": 1.8,
    "Threshold Brake Cylinder": 2
  }));

  return (
    <Card
      title="Ringkasan Telemetri Sensor"
      eyebrow={`${selectedSeries.trainsetId} - Gerbong ${selectedSeries.carNumber}`}
      action={
        <Select
          aria-label="Pilih seri telemetri"
          className="telemetry-report-select"
          value={selectedKey}
          onChange={(event) => setSelectedKey(event.target.value)}
        >
          {filteredSeries.map((item) => {
            const key = `${item.trainsetId}-${item.carNumber}`;
            return (
              <option key={key} value={key}>
                {item.trainsetId} - Gerbong {item.carNumber}
              </option>
            );
          })}
        </Select>
      }
    >
      <div className="report-chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area type="monotone" dataKey="Threshold Brake Cylinder" stroke="#64748b" strokeDasharray="3 3" fill="none" />
            <Area type="monotone" dataKey="Brake Pipe" stroke="#10b981" fillOpacity={1} fill="url(#colorBP)" />
            <Area type="monotone" dataKey="Brake Cylinder" stroke="#ef4444" fillOpacity={1} fill="url(#colorBC)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

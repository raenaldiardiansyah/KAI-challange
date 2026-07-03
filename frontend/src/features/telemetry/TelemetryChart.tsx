"use client";

import { Card } from "@/components/ui/Card";
import type { TelemetrySeries } from "@/types/telemetry";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function TelemetryChart({ series }: { series: TelemetrySeries }) {
  const data = series.points.map((point) => ({
    time: point.timestamp,
    "Brake Pipe": point.brakePipeBar,
    "Brake Cylinder": point.brakeCylinderBar,
    "Threshold Brake Cylinder": 2.0
  }));

  return (
    <Card title="Grafik Telemetri (Raw Sensor)" eyebrow={`${series.trainsetId} - Gerbong ${series.carNumber} - Brake System`}>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} tickMargin={10} minTickGap={30} />
            <YAxis domain={[0, 6]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="stepAfter" dataKey="Threshold Brake Cylinder" stroke="#64748b" strokeDasharray="3 3" dot={false} strokeWidth={1} />
            <Line type="monotone" dataKey="Brake Pipe" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Brake Cylinder" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

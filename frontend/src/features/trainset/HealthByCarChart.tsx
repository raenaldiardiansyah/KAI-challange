"use client";

import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function HealthByCarChart({ carsInsights }: { carsInsights: Insight[] }) {
  const data = carsInsights.map((c) => ({
    name: `C${c.carNumber}`,
    health: c.healthScore,
    severity: c.severity,
  }));

  const getColor = (severity: string) => {
    if (severity === "High" || severity === "Alarm") return "#ef4444";
    if (severity === "Medium" || severity === "Warning") return "#f59e0b";
    return "#10b981";
  };

  return (
    <Card title="Kesehatan Tiap Gerbong" eyebrow="Skor kesehatan">
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", fontSize: "12px" }}
            />
            <Bar dataKey="health" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

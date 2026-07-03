"use client";

import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { CarDetail } from "@/types/car";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

export function CarHealthSummary({ car }: { car: CarDetail }) {
  const getHealthColor = (score: number) => {
    if (score <= 30) return "#ef4444"; // Merah
    if (score <= 60) return "#f59e0b"; // Orange
    return "#10b981"; // Hijau
  };

  const getTrackColor = (score: number) => {
    if (score <= 30) return "#fee2e2"; 
    if (score <= 60) return "#fef3c7";
    return "#d1fae5";
  };

  const color = getHealthColor(car.healthScore);
  const trackColor = getTrackColor(car.healthScore);

  const data = [
    { name: "Health", value: car.healthScore, fill: color }
  ];

  return (
    <Card title="Status Kesehatan & Risiko" eyebrow="Snapshot">
      <div className="car-health-layout">
        <div style={{ height: "160px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar isAnimationActive={false} background={{ fill: trackColor }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: color }}>{car.healthScore}%</span>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "6px" }}>
              <MetricDelta value={car.healthScore} compact />
            </div>
          </div>
        </div>
        <div className="stack">
          <div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Masalah Utama</span>
            <strong style={{ display: "block", color: "#b91c1c" }}>Anomali Brake Cylinder</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Tingkat Keyakinan</span>
            <strong className="percent-with-delta confidence-score-row">
              <span className="percent-value">86%</span>
              <MetricDelta value={86} compact />
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Estimasi TTW</span>
            <strong style={{ display: "block", color: "#b54708" }}>2 Hari</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}

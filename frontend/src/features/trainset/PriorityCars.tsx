"use client";

import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Insight } from "@/types/insight";

export function PriorityCars({ carsInsights }: { carsInsights: Insight[] }) {
  // Sort by severity (High first, then Medium, then Normal) and health score (lowest first)
  const getSeverityWeight = (sev: string) => (sev === "High" ? 3 : sev === "Medium" ? 2 : 1);
  
  const topCars = [...carsInsights]
    .sort((a, b) => {
      const weightDiff = getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
      if (weightDiff !== 0) return weightDiff;
      return a.healthScore - b.healthScore;
    })
    .slice(0, 3);

  return (
    <Card title="Gerbong Prioritas" eyebrow="Top 3 berisiko">
      <div className="stack">
        {topCars.map((car) => (
          <div className="train-row" key={car.id} style={{ gridTemplateColumns: "auto 1fr auto" }}>
            <div style={{ background: car.severity === "High" ? "#fee2e2" : "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", color: car.severity === "High" ? "#b91c1c" : "#334155" }}>
              C{car.carNumber}
            </div>
            <div>
              <strong>{car.subsystem}</strong>
              <p style={{ fontSize: "12px" }}>{car.diagnosis}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="percent-with-delta trainset-percent-row trainset-percent-row-end">
                <strong className="percent-value" style={{ color: car.healthScore < 60 ? "#b42318" : "#047857" }}>{car.healthScore}%</strong>
                <MetricDelta value={car.healthScore} compact />
              </div>
              <p style={{ fontSize: "12px" }}>Kesehatan</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

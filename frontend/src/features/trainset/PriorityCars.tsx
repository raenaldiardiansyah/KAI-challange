"use client";

import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Insight } from "@/types/insight";
import Link from "next/link";

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
      <div className="stack trainset-priority-stack">
        {topCars.map((car) => (
          <Link
            className={`train-row trainset-priority-row severity-${car.severity.toLowerCase()}`}
            href={`/car-detail?trainset=${encodeURIComponent(car.trainsetId)}&car=${car.carNumber}&subsystem=${encodeURIComponent(car.subsystem)}`}
            key={car.id}
          >
            <div className="trainset-priority-car">
              C{car.carNumber}
            </div>
            <div className="trainset-priority-copy">
              <strong>{car.subsystem}</strong>
              <p>{car.diagnosis}</p>
            </div>
            <div className="trainset-priority-health">
              <div className="percent-with-delta trainset-percent-row trainset-percent-row-end">
                <strong className="percent-value">{car.healthScore}%</strong>
                <MetricDelta value={car.healthScore} compact />
              </div>
              <p>Kesehatan</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

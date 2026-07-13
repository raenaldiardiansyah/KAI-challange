"use client";

import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import Link from "next/link";

type TrainsetCompositionProps = {
  trainsetId: string;
  totalCars: number;
  carsInsights: Insight[];
};

export function TrainsetComposition({ trainsetId, totalCars, carsInsights }: TrainsetCompositionProps) {
  const getStatusColor = (car: number) => {
    const insight = carsInsights.find((c) => c.carNumber === car);
    if (!insight) return "#10b981"; // Normal/Green
    switch (insight.severity) {
      case "Critical":
      case "High":
        return "#ef4444"; // Red
      case "Medium":
        return "#f59e0b"; // Orange
      case "Low":
        return "#3b82f6"; // Blue
      default:
        return "#10b981"; // Green
    }
  };

  return (
    <Card title="Komposisi Kereta" eyebrow="Status Tiap Gerbong">
      <div className="composition" style={{ gridTemplateColumns: `repeat(${totalCars}, minmax(42px, 1fr))` }}>
        {Array.from({ length: totalCars }, (_, index) => {
          const car = index + 1;
          const insight = carsInsights.find((c) => c.carNumber === car);
          const color = getStatusColor(car);
          const isIssue = color !== "#10b981";
          const params = new URLSearchParams({
            trainset: insight?.trainsetId ?? trainsetId,
            car: insight?.carId ?? String(car)
          });

          if (insight?.subsystem && insight.severity !== "Normal" && insight.subsystem !== "All Systems") {
            params.set("subsystem", insight.subsystem);
          }

          return (
            <Link
              key={car}
              className="car-item"
              href={`/car-detail?${params.toString()}`}
              style={{
                backgroundColor: isIssue ? `${color}20` : "#f8fafc",
                borderColor: color,
                color: color === "#10b981" ? "#334155" : color,
                fontWeight: isIssue ? "bold" : "normal",
                cursor: "pointer"
              }}
              title={insight ? `${insight.trainsetName} - C${car} (${insight.carId ?? "ID dummy"}): ${insight.diagnosis}` : `${trainsetId} - C${car}: Belum tersedia`}
            >
              C{car}
            </Link>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "12px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#10b981", borderRadius: "2px" }}></span> Normal</div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#3b82f6", borderRadius: "2px" }}></span> Pantau</div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#f59e0b", borderRadius: "2px" }}></span> Waspada</div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#ef4444", borderRadius: "2px" }}></span> Kritis</div>
      </div>
    </Card>
  );
}

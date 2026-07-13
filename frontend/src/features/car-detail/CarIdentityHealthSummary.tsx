"use client";

import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { CarDetail } from "@/types/car";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

export function CarIdentityHealthSummary({ car }: { car: CarDetail }) {
  const healthColor = car.healthScore <= 30 ? "#ef4444" : car.healthScore <= 60 ? "#f59e0b" : "#10b981";
  const trackColor = car.healthScore <= 30 ? "#fee2e2" : car.healthScore <= 60 ? "#fef3c7" : "#d1fae5";
  const tone = car.healthScore <= 30 ? "danger" : car.healthScore <= 60 ? "warning" : "info";
  const mainSubsystem = [...car.subsystems].sort((a, b) => a.healthScore - b.healthScore)[0];

  return (
    <Card
      title={`Gerbong ${car.carNumber}`}
      eyebrow={`${car.trainsetId} - ${car.role}`}
      className={`summary-accent-card summary-tone-${tone} car-identity-health-card`}
      action={
        <div className="car-identity-status-inline">
          <StatusIndicator status={car.healthStatus} />
          <strong>Status: {car.healthStatus}</strong>
        </div>
      }
    >
      <div className="car-identity-health-layout">
        <div className="car-identity-health-gauge">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "Health", value: car.healthScore, fill: healthColor }]} startAngle={180} endAngle={0}>
              <PolarAngleAxis angleAxisId={0} domain={[0, 100]} tick={false} type="number" />
              <RadialBar background={{ fill: trackColor }} cornerRadius={10} dataKey="value" isAnimationActive={false} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div>
            <strong style={{ color: healthColor }}>{car.healthScore}%</strong>
            <MetricDelta value={car.healthScore} compact />
          </div>
        </div>

        <div className="car-identity-health-content">
          <div className="car-identity-health-metrics">
            <span>
              <small>Kesehatan</small>
              <strong>{car.healthScore}%</strong>
            </span>
            <span>
              <small>Masalah Utama</small>
              <strong>{mainSubsystem?.subsystem ?? "All Systems"}</strong>
            </span>
            <span>
              <small>Brake Pipe</small>
              <strong>{car.brakePipeBar} bar</strong>
            </span>
            <span>
              <small>Brake Cylinder</small>
              <strong>{car.brakeCylinderBar} bar</strong>
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6, color: "#64748b", fontSize: 11 }}>
        <span>{car.role}{car.backendCarId ? ` • ${car.backendCarId}` : ""}</span>
        <span>Primary Rule: {car.primaryRuleId ?? "Belum tersedia"}</span>
        <span>Primary Event: {car.primaryEventCode ?? "Belum tersedia"}</span>
        <span>Subsystem: {car.criticalSubsystemCount ?? 0} Critical • {car.warningSubsystemCount ?? 0} Warning</span>
        <span>Signals: {car.signalCount ?? "Belum tersedia"}</span>
        <span>Alarm aktif: {car.activeAlarmCount ?? "Belum tersedia"}</span>
      </div>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/Card";
import type { CarDetail } from "@/types/car";
import type { HealthStatus } from "@/types/common";

export function CarSubsystemStatus({ car }: { car: CarDetail }) {
  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "Critical":
      case "Alarm": return "#ef4444";
      case "Warning": return "#f59e0b";
      case "Watch": return "#3b82f6";
      case "Offline":
      case "Data Limited": return "#64748b";
      default: return "#10b981";
    }
  };

  const getStatusText = (status: HealthStatus) => {
    switch (status) {
      case "Critical":
      case "Alarm": return "Kritis";
      case "Warning": return "Waspada";
      case "Watch": return "Pantau";
      case "Offline": return "Offline";
      case "Data Limited": return "Data Terbatas";
      default: return "Normal";
    }
  };

  return (
    <Card title="Status Subsistem" eyebrow={`Gerbong ${car.carNumber}`}>
      <div className="subsystem-status-grid">
        {car.subsystems.map((sub, index) => (
          <div key={index} className="subsystem-status-card" style={{ background: sub.status === "Critical" || sub.status === "Alarm" ? "#fef2f2" : "#ffffff" }}>
            <div className="subsystem-status-header">
              <strong>{sub.subsystem}</strong>
              <span style={{ 
                background: getStatusColor(sub.status), 
                color: "white", 
                fontSize: "11px", 
                padding: "2px 8px", 
                borderRadius: "999px",
                fontWeight: "bold"
              }}>
                {getStatusText(sub.status)}
              </span>
            </div>
            <div className="subsystem-status-row">
              <span style={{ fontSize: "12px", color: "#64748b" }}>Skor Kesehatan</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: sub.healthScore < 60 ? "#b91c1c" : "inherit" }}>{sub.healthScore}%</span>
            </div>
            <div className="subsystem-status-row">
              <span style={{ fontSize: "12px", color: "#64748b" }}>Bukti (Evidence)</span>
              <span style={{ fontSize: "12px", fontWeight: "bold", textAlign: "right" }}>{sub.evidence}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

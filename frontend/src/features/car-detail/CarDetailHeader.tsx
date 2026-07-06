import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { CarDetail } from "@/types/car";

export function CarDetailHeader({ car }: { car: CarDetail }) {
  const chipStyle: React.CSSProperties = {
    background: "var(--surface-3, #f1f5f9)",
    color: "var(--text-strong, #0f172a)",
    padding: "8px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    flex: "1 1 150px"
  };

  return (
    <Card title={`Gerbong ${car.carNumber}`} eyebrow={`${car.trainsetId} - ${car.role}`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px", width: "100%" }}>
        <div style={chipStyle}>
          <StatusIndicator status={car.healthStatus} />
          <span>Status: {car.healthStatus}</span>
        </div>
        <div style={chipStyle}>
          <span style={{ color: "var(--text-muted)" }}>Kesehatan</span>
          <span className="percent-with-delta">
            <span className="percent-value">{car.healthScore}%</span>
            <MetricDelta value={car.healthScore} compact />
          </span>
        </div>
        <div style={chipStyle}>
          <span style={{ color: "var(--text-muted)" }}>Brake Pipe</span>
          <span>{car.brakePipeBar} bar</span>
        </div>
        <div style={chipStyle}>
          <span style={{ color: "var(--text-muted)" }}>Brake Cylinder</span>
          <span>{car.brakeCylinderBar} bar</span>
        </div>
      </div>
    </Card>
  );
}

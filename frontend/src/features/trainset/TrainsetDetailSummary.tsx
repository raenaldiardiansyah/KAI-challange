import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Trainset } from "@/types/trainset";
import { MapPin, WifiHigh, WifiSlash, Train } from "@phosphor-icons/react/dist/ssr";

export function TrainsetDetailSummary({ trainset }: { trainset: Trainset }) {
  const isOnline = trainset.dataStatus === "Online";

  const chipStyle: React.CSSProperties = {
    background: "var(--surface-3, #f1f5f9)",
    color: "var(--text-strong, #0f172a)",
    padding: "8px 16px",
    borderRadius: "99px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    flex: "1 1 200px"
  };

  return (
    <Card title={trainset.name} eyebrow="Ringkasan armada terpilih" className={`summary-accent-card summary-tone-${isOnline ? "success" : "danger"}`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px", width: "100%" }}>

        {/* Status Data */}
        <div style={chipStyle}>
          {isOnline ? <WifiHigh size={16} color="#10b981" weight="bold" /> : <WifiSlash size={16} color="#ef4444" weight="bold" />}
          <span style={{ color: isOnline ? "#10b981" : "#ef4444" }}>
            {trainset.dataStatus}
          </span>
        </div>

        {/* Lokasi */}
        <div style={chipStyle}>
          <MapPin size={16} weight="bold" color="#3b82f6" />
          {trainset.location}
        </div>

        {/* Kesehatan */}
        <div style={chipStyle}>
          <span>Kesehatan</span>
          <span className="percent-with-delta trainset-percent-row">
            <span className="percent-value">{trainset.healthScore}%</span>
            <MetricDelta value={trainset.healthScore} compact />
          </span>
        </div>

        {/* Total Gerbong */}
        <div style={chipStyle}>
          <Train size={16} weight="bold" />
          <span>{trainset.totalCars} Gerbong</span>
          <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "4px" }}>
            (Tetap)
          </span>
        </div>

      </div>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/Card";
import type { MaintenanceRisk } from "@/types/maintenance";

export function RiskSummary({ risks }: { risks: MaintenanceRisk[] }) {
  const high = risks.filter(r => r.severity === "Critical" || r.severity === "High").length;
  const medium = risks.filter(r => r.severity === "Medium").length;
  const watch = risks.filter(r => r.severity === "Low" || r.severity === "Normal").length;
  const limited = 1; // Dummy data

  return (
    <div className="summary-grid">
      <Card>
        <div className="metric-card">
          <span style={{ background: "#fee2e2", color: "#b91c1c" }}>{high}</span>
          <div>
            <strong>Risiko Tinggi</strong>
            <p>Butuh tindakan segera</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#fef3c7", color: "#d97706" }}>{medium}</span>
          <div>
            <strong>Risiko Sedang</strong>
            <p>Perlu inspeksi</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#dbeafe", color: "#1d4ed8" }}>{watch}</span>
          <div>
            <strong>Pantau (Watch)</strong>
            <p>Indikasi awal anomali</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="metric-card">
          <span style={{ background: "#f1f5f9", color: "#475569" }}>{limited}</span>
          <div>
            <strong>Data Terbatas</strong>
            <p>Koneksi sensor putus</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

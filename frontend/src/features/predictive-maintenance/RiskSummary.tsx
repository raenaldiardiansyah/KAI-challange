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
      <Card className="summary-accent-card risk-soft-high">
        <div className="metric-card">
          <span>{high}</span>
          <div>
            <strong>Risiko Tinggi</strong>
            <p>Butuh tindakan segera</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card risk-soft-medium">
        <div className="metric-card">
          <span>{medium}</span>
          <div>
            <strong>Risiko Sedang</strong>
            <p>Perlu inspeksi</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card risk-soft-watch">
        <div className="metric-card">
          <span>{watch}</span>
          <div>
            <strong>Pantau (Watch)</strong>
            <p>Indikasi awal anomali</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card risk-soft-limited">
        <div className="metric-card">
          <span>{limited}</span>
          <div>
            <strong>Data Terbatas</strong>
            <p>Koneksi sensor putus</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

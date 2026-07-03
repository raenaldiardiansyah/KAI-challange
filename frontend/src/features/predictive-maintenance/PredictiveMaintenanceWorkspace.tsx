"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MaintenanceTable } from "./MaintenanceTable";
import { RiskRanking } from "./RiskRanking";
import { RiskSummary } from "./RiskSummary";
import { RiskTrendChart } from "./RiskTrendChart";
import type { MaintenanceRisk } from "@/types/maintenance";

export function PredictiveMaintenanceWorkspace({ risks }: { risks: MaintenanceRisk[] }) {
  const [selectedId, setSelectedId] = useState(risks[0]?.id ?? "");
  const selectedRisk = risks.find((risk) => risk.id === selectedId) ?? risks[0];

  return (
    <div className="page-grid predictive-command-layout">
      <header className="section-action">
        <Button asChild icon={null}>
          <Link href="/work-order">Jadwalkan Inspeksi (Buat SPK)</Link>
        </Button>
      </header>

      <section>
        <RiskSummary risks={risks} />
      </section>

      <section className="risk-command-grid">
        <RiskRanking />
        <RiskTrendChart />
      </section>

      <section className="predictive-queue-layout">
        <MaintenanceTable risks={risks} selectedId={selectedRisk?.id} onSelectRisk={setSelectedId} />
        {selectedRisk ? (
          <Card
            title="Detail Risiko Terpilih"
            eyebrow={`${selectedRisk.trainsetId} - Gerbong ${selectedRisk.carNumber}`}
            action={<Badge label={selectedRisk.severity} severity={selectedRisk.severity} />}
          >
            <div className="predictive-detail-panel">
              <div>
                <span>Subsistem</span>
                <strong>{selectedRisk.subsystem}</strong>
              </div>
              <div>
                <span>Skor Risiko</span>
                <strong>{selectedRisk.riskScore}%</strong>
              </div>
              <div>
                <span>TTW</span>
                <strong>{selectedRisk.timeToWarning}</strong>
                <small>TTW adalah estimasi waktu menuju peringatan atau kondisi yang membutuhkan inspeksi.</small>
              </div>
              <div>
                <span>Rekomendasi Sistem</span>
                <p>{selectedRisk.recommendation}</p>
              </div>
            </div>
            <div className="predictive-detail-actions">
              <Button asChild variant="secondary">
                <Link href="/car-detail">Lihat Evidence</Link>
              </Button>
              <Button asChild>
                <Link href="/work-order">Buat SPK</Link>
              </Button>
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

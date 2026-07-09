"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Severity } from "@/types/common";

export function RiskRanking() {
  const rankings: { type: string; name: string; severity: Severity; score: number }[] = [
    { type: "Komponen", name: "Brake Cylinder (Car 5)", severity: "High", score: 92 },
    { type: "Armada", name: "Argo Wilis M02511", severity: "Medium", score: 68 },
    { type: "Gerbong", name: "Gerbong 2 (Genset)", severity: "Medium", score: 64 },
  ];

  return (
    <Card title="Prioritas Risiko Aset" eyebrow="Aset paling perlu ditindaklanjuti">
      <div className="stack">
        {rankings.map((r, i) => (
          <div key={i} className="train-row" style={{ gridTemplateColumns: "auto 1fr auto" }}>
            <span style={{ fontSize: "12px", color: "#64748b", minWidth: "70px" }}>{r.type}</span>
            <strong>{r.name}</strong>
            <div className="percent-with-delta" style={{ justifyContent: "flex-end" }}>
              <Badge label={`${r.score}%`} severity={r.severity} />
              <MetricDelta value={r.score} inverse compact />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

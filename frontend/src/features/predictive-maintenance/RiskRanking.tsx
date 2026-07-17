"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PredictiveRiskView } from "./riskViewModel";

type RiskRankingProps = {
  risks: PredictiveRiskView[];
  selectedId?: string;
  onSelectRisk: (id: string) => void;
  onOpenAll: () => void;
};

export function RiskRanking({ risks, selectedId, onSelectRisk, onOpenAll }: RiskRankingProps) {
  const rankings = [...risks].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  return (
    <Card
      title="Prioritas Risiko Aset"
      eyebrow="Aset paling perlu ditindaklanjuti"
      action={<Button variant="ghost" className="table-mini-button" onClick={onOpenAll}>Lihat Semua</Button>}
    >
      <div className="predictive-priority-list">
        {rankings.map((risk) => (
          <button
            className={`predictive-priority-item${selectedId === risk.id ? " active" : ""}`}
            key={risk.id}
            onClick={() => onSelectRisk(risk.id)}
            type="button"
          >
            <div className="predictive-priority-head">
              <span>{risk.trainsetId} - Gerbong {risk.carNumber}</span>
              <strong>{risk.subsystem}</strong>
            </div>
            <div className="predictive-priority-metrics">
              <span><small>Risiko</small><b>{risk.riskScore}%</b></span>
              <span><small>TTW</small><b>{risk.timeToWarning}</b></span>
              <span><small>Confidence</small><b>{risk.confidence}%</b></span>
              <Badge label={`Tren ${risk.trend}`} severity={risk.severity} />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

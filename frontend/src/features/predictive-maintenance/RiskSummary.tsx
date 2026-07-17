"use client";

import type { RiskFilter, PredictiveRiskView } from "./riskViewModel";
import { getRiskFilter } from "./riskViewModel";

type RiskSummaryProps = {
  risks: PredictiveRiskView[];
  activeFilter: RiskFilter;
  onFilterChange: (filter: RiskFilter) => void;
};

export function RiskSummary({ risks, activeFilter, onFilterChange }: RiskSummaryProps) {
  const cards: Array<{ id: RiskFilter; title: string; description: string; className: string; value: number }> = [
    {
      id: "high",
      title: "Risiko Tinggi",
      description: "Perlu tindakan segera",
      className: "risk-soft-high",
      value: risks.filter((risk) => getRiskFilter(risk) === "high").length
    },
    {
      id: "medium",
      title: "Risiko Sedang",
      description: "Perlu inspeksi terjadwal",
      className: "risk-soft-medium",
      value: risks.filter((risk) => getRiskFilter(risk) === "medium").length
    },
    {
      id: "watch",
      title: "Pantau",
      description: "Indikasi awal anomali",
      className: "risk-soft-watch",
      value: risks.filter((risk) => getRiskFilter(risk) === "watch").length
    },
    {
      id: "limited",
      title: "Data Terbatas",
      description: "Telemetry perlu dilengkapi",
      className: "risk-soft-limited",
      value: risks.filter((risk) => risk.missingTelemetry >= 12).length
    }
  ];

  return (
    <div className="summary-grid predictive-summary-grid" aria-label="Status risiko prediktif">
      {cards.map((card) => {
        const isActive = activeFilter === card.id;
        const isDisabled = card.value === 0 && !isActive;

        return (
          <button
            aria-disabled={isDisabled}
            aria-pressed={isActive}
            className={`predictive-risk-card summary-accent-card ${card.className}${isActive ? " active" : ""}${isDisabled ? " disabled" : ""}`}
            disabled={isDisabled}
            key={card.id}
            onClick={() => onFilterChange(isActive ? "all" : card.id)}
            type="button"
          >
            <span>{card.value}</span>
            <strong>{card.title}</strong>
            <p>{card.description}</p>
          </button>
        );
      })}
    </div>
  );
}

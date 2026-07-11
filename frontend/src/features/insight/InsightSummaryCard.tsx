import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Insight } from "@/types/insight";
import Link from "next/link";

const evidenceLabels: Record<string, { label: string; unit?: string }> = {
  bp: { label: "Brake Pipe", unit: "bar" },
  bc: { label: "Brake Cylinder", unit: "bar" },
  medianBc: { label: "Median BC", unit: "bar" },
  difference: { label: "Deviasi Aktual", unit: "bar" },
  threshold: { label: "Threshold", unit: "bar" },
};

export function InsightSummaryCard({ insight }: { insight: Insight }) {
  const visibleEvidence = Object.entries(insight.evidence).slice(0, 5);
  const workOrderUrl = `/work-order?trainset=${encodeURIComponent(insight.trainsetId)}&car=${insight.carNumber}&subsystem=${encodeURIComponent(insight.subsystem)}&source=insight-analytic`;
  const evidenceUrl = `/car-detail?trainset=${encodeURIComponent(insight.trainsetId)}&car=${insight.carNumber}&subsystem=${encodeURIComponent(insight.subsystem)}&tab=data-sensor`;

  return (
    <Card className="insight-hero-card">
      <div className="insight-hero-grid">
        <div className="insight-hero-main">
          <div className="insight-hero-title-row">
            <div>
              <p className="eyebrow">Diagnosis utama</p>
              <h2>{insight.event}</h2>
            </div>
            <Badge label={insight.severity} severity={insight.severity} />
          </div>

          <p className="insight-hero-risk">{insight.risk}</p>
          <h3>{insight.diagnosis}</h3>
          <p className="insight-hero-copy">{insight.naturalInsight}</p>

          <div className="insight-hero-recommendation">
            <span>Rekomendasi sistem</span>
            <strong>{insight.recommendation}</strong>
          </div>

          <div className="insight-hero-actions">
            <Button asChild>
              <Link href={workOrderUrl}>Buat Draft SPK</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={evidenceUrl}>Tinjau Bukti</Link>
            </Button>
          </div>
        </div>

        <aside className="insight-hero-side" aria-label="Metrik insight utama">
          <div className="insight-hero-score-row">
            <div className="insight-hero-score">
              <strong>{insight.healthScore}%</strong>
              <span>Health score</span>
              <MetricDelta value={insight.healthScore} compact />
            </div>
            <div className="insight-hero-score">
              <strong>{insight.confidence}%</strong>
              <span>Confidence</span>
              <MetricDelta value={insight.confidence} compact />
            </div>
          </div>

          <div className="insight-hero-context">
            <span>{insight.trainsetId} - C{insight.carNumber}</span>
            <strong>{insight.subsystem}</strong>
          </div>

          <div className="insight-hero-evidence-grid">
            {visibleEvidence.map(([key, value]) => {
              const meta = evidenceLabels[key] ?? { label: key };
              const isAlert = key === "bc" || key === "difference";

              return (
                <div className={isAlert ? "insight-hero-evidence alert" : "insight-hero-evidence"} key={key}>
                  <span>{meta.label}</span>
                  <strong>{value}{meta.unit ? ` ${meta.unit}` : ""}</strong>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </Card>
  );
}

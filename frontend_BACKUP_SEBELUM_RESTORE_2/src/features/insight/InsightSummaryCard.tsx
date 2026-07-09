import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Insight } from "@/types/insight";

export function InsightSummaryCard({ insight }: { insight: Insight }) {
  return (
    <Card title={insight.event} eyebrow="Diagnosis utama" action={<Badge label={insight.severity} severity={insight.severity} />}>
      <p>{insight.risk}</p>
      <div className="meta-row">
        <span>{insight.subsystem}</span>
        <span className="percent-with-delta">
          Confidence <span className="percent-value">{insight.confidence}%</span>
          <MetricDelta value={insight.confidence} compact />
        </span>
        <span className="percent-with-delta">
          Health <span className="percent-value">{insight.healthScore}%</span>
          <MetricDelta value={insight.healthScore} compact />
        </span>
      </div>
    </Card>
  );
}

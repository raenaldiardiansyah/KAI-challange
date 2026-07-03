import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function InsightSummaryCard({ insight }: { insight: Insight }) {
  return (
    <Card title={insight.event} eyebrow="Diagnosis utama" action={<Badge label={insight.severity} severity={insight.severity} />}>
      <p>{insight.risk}</p>
      <div className="meta-row">
        <span>{insight.subsystem}</span>
        <span>Confidence {insight.confidence}%</span>
        <span>Health {insight.healthScore}%</span>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function NaturalInsightPanel({ insight }: { insight: Insight }) {
  return (
    <Card title="Insight AI (Natural Language)" eyebrow="Hasil Natural Insight dari Backend Analytic Engine">
      <p className="natural-text">{insight.naturalInsight}</p>
    </Card>
  );
}

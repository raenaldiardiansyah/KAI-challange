import { GaugeChart } from "@/components/charts/GaugeChart";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function HealthScoreCard({ insight }: { insight: Insight }) {
  return (
    <Card title="Health Score" eyebrow={insight.subsystem}>
      <GaugeChart value={insight.healthScore} label="Subsystem health" />
    </Card>
  );
}

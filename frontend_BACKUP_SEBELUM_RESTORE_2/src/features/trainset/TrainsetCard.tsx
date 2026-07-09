import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { Trainset } from "@/types/trainset";

export function TrainsetCard({ trainset }: { trainset: Trainset }) {
  return (
    <Card>
      <div className="trainset-card trainset-card-compact">
        <div>
          <strong>{trainset.name}</strong>
          <p>{trainset.id} - {trainset.route}</p>
        </div>
        <StatusIndicator status={trainset.healthStatus} />
        <span className="percent-with-delta trainset-percent-row">
          <Badge label={`${trainset.alarmCount} alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
          <MetricDelta value={trainset.alarmCount} delta={trainset.alarmCount > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
        </span>
        <span className="percent-with-delta trainset-percent-row">
          <span className="percent-value">{trainset.healthScore}%</span>
          <MetricDelta value={trainset.healthScore} compact />
        </span>
      </div>
    </Card>
  );
}

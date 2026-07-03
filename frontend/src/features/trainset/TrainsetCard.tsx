import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
        <Badge label={`${trainset.alarmCount} alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
        <span>{trainset.healthScore}% kesehatan</span>
      </div>
    </Card>
  );
}

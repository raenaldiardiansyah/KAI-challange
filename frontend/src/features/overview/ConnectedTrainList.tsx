import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { Trainset } from "@/types/trainset";
import { formatDate } from "@/utils/formatDate";

export function ConnectedTrainList({ trainsets }: { trainsets: Trainset[] }) {
  return (
    <Card title="Armada Terhubung" eyebrow="Prioritas armada">
      <div className="stack">
        {trainsets.map((trainset) => (
          <div className="train-row overview-train-row" key={trainset.id}>
            <div className="overview-train-identity">
              <strong>{trainset.name}</strong>
              <p>{trainset.route} - {trainset.location}</p>
            </div>
            <StatusIndicator status={trainset.healthStatus} />
            <span className="percent-with-delta">
              <Badge label={`${trainset.alarmCount} alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
              <MetricDelta value={trainset.alarmCount} delta={trainset.alarmCount > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
            </span>
            <span className="overview-train-date">{formatDate(trainset.lastUpdate)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

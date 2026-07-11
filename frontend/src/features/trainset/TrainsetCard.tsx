import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import Link from "next/link";
import type { Trainset } from "@/types/trainset";

export function TrainsetCard({ trainset, active = false, page = 1 }: { trainset: Trainset; active?: boolean; page?: number }) {
  const affectedCars = Math.min(trainset.alarmCount, trainset.totalCars);
  const dataStatusLabel = trainset.online ? "Online" : "Offline";
  const routeLabel = `${trainset.id} - ${trainset.route}`;
  const metaLabel = `${affectedCars} gerbong perlu perhatian - ${trainset.totalCars} gerbong - ${dataStatusLabel}`;

  return (
    <Link className="trainset-card-link" href={`/trainset?trainset=${encodeURIComponent(trainset.id)}&trainsetPage=${page}`} aria-current={active ? "page" : undefined}>
      <Card className={active ? "trainset-card-selected" : ""}>
      <div className="trainset-card trainset-card-compact">
        <div className="trainset-card-identity">
          <strong title={trainset.name}>{trainset.name}</strong>
          <p title={routeLabel}>{routeLabel}</p>
        </div>
        <span className="trainset-card-meta" title={metaLabel}>
          {metaLabel}
        </span>
        <div className="trainset-card-details">
          <span>
            <small>Lokasi</small>
            <strong title={trainset.location}>{trainset.location}</strong>
          </span>
          <span>
            <small>Update</small>
            <strong title={trainset.lastUpdate}>{trainset.lastUpdate}</strong>
          </span>
        </div>
        <StatusIndicator status={trainset.healthStatus} />
        <span className="percent-with-delta trainset-percent-row trainset-card-alarm">
          <Badge label={`${trainset.alarmCount} alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
          <MetricDelta value={trainset.alarmCount} delta={trainset.alarmCount > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
        </span>
        <span className="percent-with-delta trainset-percent-row trainset-card-health">
          <span className="percent-value">{trainset.healthScore}%</span>
          <MetricDelta value={trainset.healthScore} compact />
        </span>
      </div>
      </Card>
    </Link>
  );
}

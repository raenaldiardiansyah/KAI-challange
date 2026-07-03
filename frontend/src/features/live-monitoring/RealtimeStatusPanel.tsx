import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { Trainset } from "@/types/trainset";

import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatDate";

export function RealtimeStatusPanel({ trainsets }: { trainsets: Trainset[] }) {
  return (
    <Card title="Daftar Kereta Terhubung" eyebrow="Status Real-time">
      <div className="stack">
        {trainsets.map((trainset) => (
          <div className="risk-row realtime-train-row" key={trainset.id}>
            <div>
              <strong>{trainset.name}</strong>
              <p>{trainset.route} • {trainset.dataStatus}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "12px" }}>
              <StatusIndicator status={trainset.healthStatus} />
              <div className="percent-with-delta" style={{ justifyContent: "flex-end", marginTop: "6px" }}>
                <span className="percent-value">{trainset.healthScore}%</span>
                <MetricDelta value={trainset.healthScore} compact />
              </div>
            </div>
            <div>
              <span className="percent-with-delta">
                <Badge label={`${trainset.alarmCount} Alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
                <MetricDelta value={trainset.alarmCount} delta={trainset.alarmCount > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", textAlign: "right" }}>
              {formatDate(trainset.lastUpdate)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

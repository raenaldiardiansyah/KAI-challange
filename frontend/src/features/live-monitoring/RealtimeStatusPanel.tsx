import { Card } from "@/components/ui/Card";
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
              <div style={{ marginTop: "4px" }}>{trainset.healthScore}%</div>
            </div>
            <div>
              <Badge label={`${trainset.alarmCount} Alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
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

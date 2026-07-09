import { Card } from "@/components/ui/Card";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus } from "@/types/common";

const statusLabel: Record<AlarmStatus, string> = {
  Open: "Terbuka",
  Acknowledged: "Diketahui",
  Closed: "Selesai",
  "Auto Cleared": "Selesai Otomatis"
};

export function AlarmDetail({ alarm }: { alarm: Alarm }) {
  return (
    <Card title={alarm.message} eyebrow={alarm.id}>
      <div className="detail-grid">
        <span>{alarm.trainsetId} Gerbong {alarm.carNumber}</span>
        <span>{alarm.subsystem}</span>
        <span>{statusLabel[alarm.status]}</span>
        <span>{alarm.detectedAt}</span>
      </div>
    </Card>
  );
}

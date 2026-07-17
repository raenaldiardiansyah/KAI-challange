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
    <Card title={alarm.message} eyebrow={alarm.id} className="alarm-detail-card">
      <div className="alarm-detail-panel">
        <div className="alarm-detail-kpis">
          <span><small>Aset</small><strong>{alarm.trainsetId} C{alarm.carNumber}</strong></span>
          <span><small>Subsistem</small><strong>{alarm.subsystem}</strong></span>
          <span><small>Status</small><strong>{statusLabel[alarm.status]}</strong></span>
          <span><small>Terdeteksi</small><strong>{alarm.detectedAt}</strong></span>
        </div>

        <section>
          <span>Evidence ringkas</span>
          <p>
            Alarm terhubung ke {alarm.subsystem} pada {alarm.trainsetId} Gerbong {alarm.carNumber}. Prioritaskan validasi sensor,
            pemeriksaan komponen, dan pencocokan dengan telemetry gerbong pembanding.
          </p>
        </section>

        <section>
          <span>Lifecycle alarm</span>
          <div className="alarm-detail-timeline">
            <b>Deteksi awal</b>
            <b>{alarm.status === "Open" ? "Menunggu acknowledge" : "Sudah masuk antrean tindak lanjut"}</b>
            <b>{alarm.status === "Closed" || alarm.status === "Auto Cleared" ? "Selesai" : "Belum selesai"}</b>
          </div>
        </section>

        <section>
          <span>Tindak lanjut disarankan</span>
          <p>
            Buka Evidence untuk melihat konteks Gerbong, lalu buat SPK jika alarm masih aktif atau berulang pada subsistem yang sama.
          </p>
        </section>
      </div>
    </Card>
  );
}

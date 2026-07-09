import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus, Severity } from "@/types/common";

const severityLabel: Record<Severity, string> = {
  Critical: "Kritis",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
  Normal: "Normal"
};

const statusLabel: Record<AlarmStatus, string> = {
  Open: "Terbuka",
  Acknowledged: "Diakui",
  Closed: "Ditutup",
  "Auto Cleared": "Selesai Otomatis"
};

const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low", "Normal"];
const statusOrder: AlarmStatus[] = ["Open", "Acknowledged", "Closed", "Auto Cleared"];

const severityToneClass: Record<Severity, string> = {
  Critical: "danger",
  High: "danger",
  Medium: "warning",
  Low: "info",
  Normal: "normal"
};

export function ActiveAlarmTable({ alarms }: { alarms: Alarm[] }) {
  const severityData = severityOrder.map((severity) => ({
    severity,
    label: severityLabel[severity],
    value: alarms.filter((alarm) => alarm.severity === severity).length,
    tone: severityToneClass[severity]
  })).filter((item) => item.value > 0);
  const statusData = statusOrder.map((status) => ({
    status,
    label: statusLabel[status],
    value: alarms.filter((alarm) => alarm.status === status).length
  }));
  const maxSeverityCount = Math.max(...severityData.map((item) => item.value), 1);
  const highPriorityCount = alarms.filter((alarm) => alarm.severity === "Critical" || alarm.severity === "High").length;
  const openCount = alarms.filter((alarm) => alarm.status === "Open").length;

  return (
    <Card
      title="Grafik Alarm"
      eyebrow="Ringkasan tindakan cepat"
      action={<Link className="button button-secondary table-mini-button" href="/alarm-center">Lihat semua alarm</Link>}
    >
      <div className="overview-alarm-chart">
        {alarms.length > 0 ? (
          <>
            <div className="overview-alarm-chart-summary">
              <div>
                <strong>{alarms.length}</strong>
                <span>Total Alarm</span>
              </div>
              <div>
                <strong>{highPriorityCount}</strong>
                <span>Prioritas Tinggi</span>
              </div>
              <div>
                <strong>{openCount}</strong>
                <span>Terbuka</span>
              </div>
            </div>

            <div className="overview-alarm-bars" aria-label="Grafik distribusi severity alarm">
              {severityData.map((item) => (
                <div className="overview-alarm-bar-row" key={item.severity}>
                  <span>{item.label}</span>
                  <div className="overview-alarm-bar-track">
                    <i
                      className={`overview-alarm-bar-fill ${item.tone}`}
                      style={{ width: `${Math.max((item.value / maxSeverityCount) * 100, 8)}%` }}
                    />
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="overview-alarm-status-grid" aria-label="Ringkasan status alarm">
              {statusData.map((item) => (
                <div key={item.status}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="overview-empty-state">
            <strong>Tidak ada alarm aktif</strong>
            <span>Armada aktif berada dalam kondisi normal.</span>
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Alarm } from "@/types/alarm";

export function AlarmSummary({ alarms }: { alarms: Alarm[] }) {
  const open = alarms.filter(a => a.status === "Open").length;
  const ack = alarms.filter(a => a.status === "Acknowledged").length;
  const cleared = alarms.filter((alarm) => alarm.status === "Auto Cleared").length;
  const high = alarms.filter(a => a.severity === "High" || a.severity === "Critical").length;

  return (
    <div className="summary-grid">
      <Card className="summary-accent-card summary-tone-danger">
        <div className="metric-card">
          <span>{open}</span>
          <div>
            <strong>Belum Ditangani</strong>
            <MetricDelta value={open} delta={open > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
            <p>Status: Open</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card summary-tone-warning">
        <div className="metric-card">
          <span>{ack}</span>
          <div>
            <strong>Sedang Dicek</strong>
            <MetricDelta value={ack} delta={ack > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
            <p>Status: Acknowledged</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card summary-tone-info">
        <div className="metric-card">
          <span>{cleared}</span>
          <div>
            <strong>Auto Cleared</strong>
            <MetricDelta value={cleared} delta={1} compact unit="alarm" label="alarm" />
            <p>Selesai otomatis</p>
          </div>
        </div>
      </Card>
      <Card className="summary-accent-card summary-tone-danger">
        <div className="metric-card">
          <span>{high}</span>
          <div>
            <strong>Risiko Tinggi</strong>
            <MetricDelta value={high} delta={high > 0 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
            <p>Severity High/Critical</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

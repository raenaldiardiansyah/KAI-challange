"use client";

import { Warning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import Link from "next/link";

const severityLabel: Record<string, string> = {
  Critical: "Kritis",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
  Normal: "Normal"
};

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toNumber(value: string | number | undefined) {
  return typeof value === "number" ? value : undefined;
}

function evidenceNumber(insight: Insight, key: string, fallback = 0) {
  return toNumber(insight.evidence[key]) ?? fallback;
}

function buildEvidenceMeters(insight: Insight, riskScore: number, isAlert: boolean) {
  if (insight.subsystem === "Brake System") {
    const pressureDeviation = clampMetric((evidenceNumber(insight, "difference", 0.8) / 1.5) * 100);
    const valveResponseDelay = clampMetric(
      (evidenceNumber(insight, "bc", 1.1) / Math.max(evidenceNumber(insight, "medianBc", 2.3), 0.1)) * 100
    );
    const leakProbability = clampMetric(isAlert ? Math.max(62, riskScore - 16) : Math.max(12, riskScore - 28));

    return [
      { label: "Brake Pressure Deviation", value: pressureDeviation },
      { label: "Valve Response Delay", value: valveResponseDelay },
      { label: "Leak Probability", value: leakProbability },
      { label: "Confidence", value: insight.confidence }
    ];
  }

  if (insight.subsystem === "Genset") {
    const frequencyDrift = clampMetric((Math.abs(50 - evidenceNumber(insight, "frequency", 50)) / 5) * 100);
    const voltageDeviation = clampMetric((Math.abs(400 - evidenceNumber(insight, "voltage", 400)) / 40) * 100);
    const rpmVariance = clampMetric((Math.abs(1500 - evidenceNumber(insight, "rpm", 1500)) / 220) * 100);

    return [
      { label: "Frequency Drift", value: frequencyDrift },
      { label: "Voltage Deviation", value: voltageDeviation },
      { label: "RPM Variance", value: rpmVariance },
      { label: "Confidence", value: insight.confidence }
    ];
  }

  if (insight.subsystem === "Door") {
    const packetLoss = clampMetric((evidenceNumber(insight, "missingPackets", 0) / 30) * 100);
    const signalDelay = clampMetric((evidenceNumber(insight, "lastValidSignalMinutes", 0) / 90) * 100);
    const cycleLoad = clampMetric((evidenceNumber(insight, "doorOpenCount", 0) / 50) * 100);

    return [
      { label: "Telemetry Packet Loss", value: packetLoss },
      { label: "Signal Delay", value: signalDelay },
      { label: "Door Cycle Load", value: cycleLoad },
      { label: "Confidence", value: insight.confidence }
    ];
  }

  const healthVariance = clampMetric(evidenceNumber(insight, "healthVariance", 100 - insight.healthScore));
  const telemetryLatency = clampMetric(evidenceNumber(insight, "telemetryLatency", Math.max(4, riskScore - 18)));
  const maintenanceMargin = clampMetric(evidenceNumber(insight, "maintenanceMargin", Math.max(6, riskScore - 22)));

  return [
    { label: "Health Variance", value: healthVariance },
    { label: "Telemetry Latency", value: telemetryLatency },
    { label: "Maintenance Margin", value: maintenanceMargin },
    { label: "Confidence", value: insight.confidence }
  ];
}

export function PriorityInsightCard({ insight }: { insight: Insight }) {
  const isHighAlert = insight.severity === "High" || insight.severity === "Critical";
  const isMediumAlert = insight.severity === "Medium";
  const hasAlertIcon = isHighAlert || isMediumAlert;
  const severityText = severityLabel[insight.severity] ?? insight.severity;
  const riskScore = clampMetric(
    insight.severity === "Critical" ? 94 :
    insight.severity === "High" ? Math.max(82, 100 - insight.healthScore + 28) :
    insight.severity === "Medium" ? Math.max(58, 100 - insight.healthScore + 12) :
    Math.max(8, 100 - insight.healthScore)
  );
  const evidenceMeters = buildEvidenceMeters(insight, riskScore, isHighAlert);
  const params = new URLSearchParams({
    trainset: insight.trainsetId,
    car: String(insight.carNumber),
    subsystem: insight.subsystem
  });
  const workOrderParams = new URLSearchParams(params);
  workOrderParams.set("source", "overview");

  return (
    <Card title="Insight Aktif" eyebrow="Ringkasan Prioritas" className={`overview-priority-card${isHighAlert ? " overview-priority-card-alert" : ""}${isMediumAlert ? " overview-priority-card-warning" : ""}`}>
      <div className={`overview-priority-shell${hasAlertIcon ? "" : " overview-priority-shell-normal"}`}>
        {hasAlertIcon ? (
          <span className="overview-priority-icon" aria-hidden>
            <Warning size={24} weight="fill" />
          </span>
        ) : null}
        <div className="overview-priority-content">
          <h4 className="overview-priority-title">C{insight.carNumber} {insight.subsystem} - Risiko {severityText}</h4>
          <p className="overview-priority-description">{insight.diagnosis}</p>
          <p className="overview-priority-recommendation">{insight.recommendation}</p>
          
          <div className="overview-priority-actions">
            <Link href="/insight-analytic" className="button button-primary">Lihat Insight</Link>
            <Link href={`/car-detail?${params.toString()}`} className="button button-secondary">Tinjau Bukti</Link>
            <Link href={`/work-order?${workOrderParams.toString()}`} className="button button-ghost">Buat SPK</Link>
          </div>
        </div>
        <aside className="overview-priority-metrics" aria-label="Ringkasan skor risiko dan bukti">
          <div className="overview-metrics-head">
            <div className="overview-risk-score">
              <div className="overview-risk-donut" aria-label={`Risk score ${riskScore} dari 100`}>
                <strong>{riskScore}</strong>
                <span>/100</span>
              </div>
              <div>
                <span>Risk Score</span>
                <strong>Evidence threshold</strong>
              </div>
            </div>
            <Badge label={severityText} severity={insight.severity} />
          </div>
          <div className="overview-threshold-meters">
            {evidenceMeters.map((item) => (
              <div className="overview-threshold-row" key={item.label}>
                <div className="overview-threshold-head">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="overview-threshold-labels" aria-hidden>
                  <span>Normal</span>
                  <span>Warning</span>
                  <span>Critical</span>
                </div>
                <div className="overview-threshold-track">
                  <span className="overview-threshold-zone overview-threshold-zone-normal" />
                  <span className="overview-threshold-zone overview-threshold-zone-warning" />
                  <span className="overview-threshold-zone overview-threshold-zone-critical" />
                  <i className="overview-threshold-marker" style={{ left: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Card>
  );
}

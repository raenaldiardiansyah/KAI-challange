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

export function PriorityInsightCard({ insight }: { insight: Insight }) {
  const isAlert = insight.severity === "High" || insight.severity === "Critical";
  const params = new URLSearchParams({
    trainset: insight.trainsetId,
    car: String(insight.carNumber),
    subsystem: insight.subsystem
  });

  return (
    <Card title="Insight Aktif" eyebrow="Ringkasan Prioritas" action={<Badge label={severityLabel[insight.severity] ?? insight.severity} severity={insight.severity} />} className="overview-priority-card">
      <div className="overview-priority-shell">
        {isAlert ? <Warning size={24} weight="fill" color="var(--danger)" aria-hidden /> : null}
        <div className="overview-priority-content">
          <h4 className="overview-priority-title">C{insight.carNumber} {insight.subsystem} - Risiko {severityLabel[insight.severity] ?? insight.severity}</h4>
          <p className="overview-priority-description">{insight.diagnosis}</p>
          <p className="overview-priority-recommendation">{insight.recommendation}</p>
          
          <div className="overview-priority-actions">
            <Link href="/insight-analytic" className="button button-primary">Lihat Insight</Link>
            <Link href={`/car-detail?${params.toString()}`} className="button button-secondary">Tinjau Bukti</Link>
            <Link href="/work-order" className="button button-ghost">Buat SPK</Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

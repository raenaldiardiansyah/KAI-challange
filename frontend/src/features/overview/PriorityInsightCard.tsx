"use client";

import { Warning, FileText, ArrowRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import Link from "next/link";

export function PriorityInsightCard({ insight }: { insight: Insight }) {
  const isAlert = insight.severity === "High" || insight.severity === "Critical";

  return (
    <Card title="Insight Prioritas" eyebrow="Ringkasan Cepat" className="overview-priority-card">
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", height: "100%" }}>
        {isAlert && <Warning size={24} weight="fill" color="var(--danger)" style={{ marginTop: "4px" }} />}
        <div className="overview-priority-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h4 className="overview-priority-title" style={{ margin: 0 }}>C{insight.carNumber} {insight.trainsetName}</h4>
            <Badge label={insight.severity} severity={insight.severity} />
          </div>
          <p className="overview-priority-description" style={{ margin: "0 0 4px 0" }}>{insight.diagnosis}</p>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{insight.recommendation}</p>
          
          <div className="overview-priority-actions">
            <Link href={`/insight-analytic`} className="button button-secondary">Lihat Insight</Link>
            <Link href={`/car-detail?car=${insight.carNumber}`} className="button button-secondary">Tinjau Bukti</Link>
            <Link href={`/work-order`} className="button button-primary">Buat SPK</Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

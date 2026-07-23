"use client";

import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/report";

const categoryTone: Record<Report["type"], string> = {
  Insight: "blue",
  Alarm: "red",
  Maintenance: "amber",
  Telemetry: "green",
  Reliability: "slate"
};

export function ReportCategoryCards({ reports }: { reports: Report[] }) {
  return (
    <Card title="Kategori Laporan" eyebrow="Quick access report RAMS">
      <div className="report-category-grid">
        {reports.map((report) => (
          <a className={`report-category-card tone-${categoryTone[report.type]}`} href="#report-archive" key={report.id}>
            <span>{report.type}</span>
            <strong>{report.title}</strong>
            <p>{report.summary}</p>
            <small>{report.period}</small>
          </a>
        ))}
      </div>
    </Card>
  );
}

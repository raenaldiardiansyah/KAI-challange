import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/report";

export function ReportDetail({ report }: { report: Report }) {
  return (
    <Card title={report.title} eyebrow={report.id}>
      <p>{report.summary}</p>
      <span>Generated at {report.generatedAt}</span>
    </Card>
  );
}

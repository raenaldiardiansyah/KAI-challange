import { ReportPageClient } from "@/features/report/ReportPageClient";
import { getAlarms } from "@/services/alarmService";
import { getReports } from "@/services/reportService";
import { getTrainsets } from "@/services/trainsetService";
import { getTelemetry } from "@/services/telemetryService";

export default async function ReportAnalyticsPage() {
  const [alarms, reports, trainsets, telemetry] = await Promise.all([
    getAlarms(),
    getReports(),
    getTrainsets(),
    getTelemetry(),
  ]);

  return (
    <ReportPageClient
      alarms={alarms}
      reports={reports}
      trainsets={trainsets}
      telemetry={telemetry}
    />
  );
}

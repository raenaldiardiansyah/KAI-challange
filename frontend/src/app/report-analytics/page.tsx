import { ReportPageClient } from "@/features/report/ReportPageClient";
import { alarmDummy } from "@/dummy/alarmDummy";
import { getReports } from "@/services/reportService";
import { getTrainsets } from "@/services/trainsetService";
import { getTelemetry } from "@/services/telemetryService";

export default async function ReportAnalyticsPage() {
  const [alarms, reports, trainsets, telemetry] = await Promise.all([
    Promise.resolve(alarmDummy),
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

import { ReportPageClient } from "@/features/report/ReportPageClient";
import { getAlarms } from "@/services/alarmService";
import { getTrainsets } from "@/services/trainsetService";
import { getTelemetry } from "@/services/telemetryService";

export default async function ReportAnalyticsPage() {
  const [alarms, trainsets, telemetry] = await Promise.all([
    getAlarms(),
    getTrainsets(),
    getTelemetry(),
  ]);

  return (
    <ReportPageClient
      alarms={alarms}
      trainsets={trainsets}
      telemetry={telemetry}
    />
  );
}

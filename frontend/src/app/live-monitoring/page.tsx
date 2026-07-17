import { LiveMonitoringWorkspace } from "@/features/live-monitoring/LiveMonitoringWorkspace";
import { getOverviewData } from "@/services/overviewService";

export default async function LiveMonitoringPage() {
  const overview = await getOverviewData();

  return (
    <LiveMonitoringWorkspace points={overview.mapPoints} trainsets={overview.trainsets} />
  );
}

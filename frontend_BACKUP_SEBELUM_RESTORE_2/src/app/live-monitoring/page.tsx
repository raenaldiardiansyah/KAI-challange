import { LiveTrainMap } from "@/features/live-monitoring/LiveTrainMap";
import { RealtimeStatusPanel } from "@/features/live-monitoring/RealtimeStatusPanel";
import { getOverviewData } from "@/services/overviewService";

export default async function LiveMonitoringPage() {
  const overview = await getOverviewData();

  return (
    <div className="page-grid live-monitoring-grid">
      <div className="live-map-column">
        <LiveTrainMap points={overview.mapPoints} />
      </div>
      <div className="live-side-column">
        <RealtimeStatusPanel trainsets={overview.trainsets} />
      </div>
    </div>
  );
}

import { ActiveAlarmTable } from "@/features/overview/ActiveAlarmTable";
import { ConnectedTrainList } from "@/features/overview/ConnectedTrainList";
import { PredictiveMaintenancePanel } from "@/features/overview/PredictiveMaintenancePanel";
import { InteractiveTrainsetPanel } from "@/features/overview/InteractiveTrainsetPanel";
import { SummaryCards } from "@/features/overview/SummaryCards";
import { TrainPositionMap } from "@/features/overview/TrainPositionMap";
import { getOverviewData } from "@/services/overviewService";

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <>
      <div className="page-grid overview-layout">
        <section className="overview-critical-row">
          <div className="stack">
            <InteractiveTrainsetPanel carInsights={data.carInsights} />
          </div>
          <TrainPositionMap points={data.mapPoints} />
        </section>

        <SummaryCards summary={data.summary} />

        <section className="overview-alarm-wide">
          <ActiveAlarmTable alarms={data.alarms} />
        </section>

        <section className="overview-followup-grid">
          <PredictiveMaintenancePanel risks={data.maintenance} />
          <ConnectedTrainList trainsets={data.trainsets} />
        </section>
      </div>
    </>
  );
}

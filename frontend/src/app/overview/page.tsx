import { ActiveAlarmTable } from "@/features/overview/ActiveAlarmTable";
import { PredictiveMaintenancePanel } from "@/features/overview/PredictiveMaintenancePanel";
import { InteractiveTrainsetPanel } from "@/features/overview/InteractiveTrainsetPanel";
import { SummaryCards } from "@/features/overview/SummaryCards";
import { TrainPositionMap } from "@/features/overview/TrainPositionMap";
import { getOverviewData } from "@/services/overviewService";

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <>
      <div className="page-grid overview-compact-layout">
        <section className="overview-top-grid">
          <div>
            <InteractiveTrainsetPanel carInsights={data.carInsights} />
          </div>
          <TrainPositionMap points={data.mapPoints} />
        </section>

        <section className="overview-row-2">
          <SummaryCards summary={data.summary} />
        </section>

        <section className="overview-bottom-grid">
          <ActiveAlarmTable alarms={data.alarms} />
          <PredictiveMaintenancePanel risks={data.maintenance} insights={data.carInsights} />
        </section>
      </div>
    </>
  );
}

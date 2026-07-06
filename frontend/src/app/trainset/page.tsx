import { TrainsetDetailSummary } from "@/features/trainset/TrainsetDetailSummary";
import { TrainsetList } from "@/features/trainset/TrainsetList";
import { TrainsetComposition } from "@/features/trainset/TrainsetComposition";
import { PriorityCars } from "@/features/trainset/PriorityCars";
import { HealthByCarChart } from "@/features/trainset/HealthByCarChart";
import { SubsystemHeatmap } from "@/features/trainset/SubsystemHeatmap";
import { getOverviewData } from "@/services/overviewService";
import { getTrainsets } from "@/services/trainsetService";

export default async function TrainsetPage() {
  const [trainsets, overview] = await Promise.all([getTrainsets(), getOverviewData()]);
  const selectedTrainset = trainsets[0];
  const carInsights = overview.carInsights;

  return (
    <div className="page-grid trainset-master-layout">
      <aside className="master-list-panel">
        <TrainsetList trainsets={trainsets} />
      </aside>
      <section className="stack detail-workspace">
        <TrainsetDetailSummary trainset={selectedTrainset} />
        
        <TrainsetComposition trainsetId={selectedTrainset.id} totalCars={selectedTrainset.totalCars} carsInsights={carInsights} />
        
        <div className="two-column-grid">
          <PriorityCars carsInsights={carInsights} />
          <HealthByCarChart carsInsights={carInsights} />
        </div>
        
        <SubsystemHeatmap trainsetId={selectedTrainset.id} trainsetName={selectedTrainset.name} totalCars={selectedTrainset.totalCars} carsInsights={carInsights} />
      </section>
    </div>
  );
}

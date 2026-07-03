import { CarDetailHeader } from "@/features/car-detail/CarDetailHeader";
import { CarHealthSummary } from "@/features/car-detail/CarHealthSummary";
import { CarSelectorFilter } from "@/features/car-detail/CarSelectorFilter";
import { CarDetailInvestigationTabs } from "@/features/car-detail/CarDetailInvestigationTabs";
import { getCarDetails } from "@/services/carDetailService";
import { getTelemetry } from "@/services/telemetryService";
import { getTrainsets } from "@/services/trainsetService";

export default async function CarDetailPage({ searchParams }: { searchParams?: { car?: string } }) {
  const [cars, telemetrySeries, trainsets] = await Promise.all([
    getCarDetails(), 
    getTelemetry(),
    getTrainsets()
  ]);
  
  const targetCarNumber = searchParams?.car ? parseInt(searchParams.car, 10) : cars[0].carNumber;
  const car = cars.find((c) => c.carNumber === targetCarNumber) || cars[0];

  const selectedTelemetry = telemetrySeries.find(
    (series) => series.trainsetId === car.trainsetId && series.carNumber === car.carNumber
  ) ?? telemetrySeries[0];

  const issueTrainsets = trainsets.filter(t => t.healthStatus !== "Healthy" && t.healthStatus !== "Watch").map(t => t.id);
  const issueCars = cars.filter(c => c.healthScore < 70).map(c => c.carNumber);

  return (
    <>
      <div className="page-grid">
        <CarSelectorFilter 
          defaultCar={targetCarNumber.toString()} 
          trainsets={trainsets.map(t => ({ id: t.id, name: t.name }))}
          issueTrainsets={issueTrainsets}
          issueCars={issueCars}
        />
        
        <div className="car-detail-summary-grid">
          <CarDetailHeader car={car} />
          <CarHealthSummary car={car} />
        </div>

        <CarDetailInvestigationTabs car={car} telemetry={selectedTelemetry} />
      </div>
    </>
  );
}

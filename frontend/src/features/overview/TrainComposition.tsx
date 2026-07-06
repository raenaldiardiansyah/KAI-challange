import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import Link from "next/link";

type TrainCompositionProps = {
  totalCars: number;
  selectedCar: number;
  carsInsights: Insight[];
  onSelectCar: (car: number) => void;
};

export function TrainComposition({
  totalCars,
  selectedCar,
  carsInsights,
  onSelectCar
}: TrainCompositionProps) {
  const fallbackTrainsetId = carsInsights[0]?.trainsetId;

  return (
    <Card title="Komposisi Kereta" eyebrow="Mewakili armada aktif">
      <div className="composition">
        {Array.from({ length: totalCars }, (_, index) => {
          const car = index + 1;
          const isSelected = car === selectedCar;
          const insight = carsInsights.find(c => c.carNumber === car);
          const isAnomaly = insight?.severity === "High" || insight?.severity === "Critical" || insight?.severity === "Medium";
          const params = new URLSearchParams();
          const trainsetId = insight?.trainsetId ?? fallbackTrainsetId;

          if (trainsetId) params.set("trainset", trainsetId);
          params.set("car", String(car));
          if (insight?.subsystem) params.set("subsystem", insight.subsystem);

          let className = "car-item";
          if (isSelected) className += " selected";
          if (isAnomaly) className += " anomaly";

          return (
            <Link
              key={car}
              className={className}
              href={`/car-detail?${params.toString()}`}
              onClick={() => onSelectCar(car)}
              title={isAnomaly ? `${insight?.trainsetName} - C${car}: ${insight?.diagnosis}` : `${insight?.trainsetName || "Trainset"} - C${car}: Normal`}
            >
              C{car}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

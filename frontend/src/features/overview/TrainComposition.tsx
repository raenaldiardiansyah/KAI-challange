import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

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
  return (
    <Card title="Komposisi Kereta" eyebrow="Mewakili armada aktif">
      <div className="composition">
        {Array.from({ length: totalCars }, (_, index) => {
          const car = index + 1;
          const isSelected = car === selectedCar;
          const insight = carsInsights.find(c => c.carNumber === car);
          const isAnomaly = insight?.severity === "High" || insight?.severity === "Critical" || insight?.severity === "Medium";

          let className = "car-item";
          if (isSelected) className += " selected";
          if (isAnomaly) className += " anomaly";

          return (
            <span
              key={car}
              className={className}
              onClick={() => onSelectCar(car)}
              title={isAnomaly ? `${insight?.trainsetName} - C${car}: ${insight?.diagnosis}` : `${insight?.trainsetName || "Trainset"} - C${car}: Normal`}
            >
              C{car}
            </span>
          );
        })}
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

type TrainCompositionProps = {
  totalCars: number;
  selectedCar: number;
  carsInsights: Insight[];
  onSelectCar: (car: number) => void;
};

type CarVisualStatus = "normal" | "warning" | "critical" | "no-data";

function getVisualStatus(insight?: Insight): CarVisualStatus {
  if (!insight) return "no-data";
  if (insight.severity === "High" || insight.severity === "Critical") return "critical";
  if (insight.severity === "Medium") return "warning";
  return "normal";
}

function getAnomalyLabel(insight?: Insight) {
  if (!insight || insight.event === "NO_ACTIVE_ANOMALY") return null;
  if (insight.event === "LOCAL_BC_DEVIATION") return "Brake Cylinder Deviation";

  return insight.event
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TrainCarIcon({ label, status }: { label: string; status: CarVisualStatus }) {
  const showIndicator = status === "warning" || status === "critical";

  return (
    <svg className="train-car-svg" viewBox="0 0 64 42" aria-hidden="true">
      <rect className="train-car-body" x="2" y="3" width="60" height="29" rx="5" />
      <path className="train-car-detail" d="M8 10h48M10 25h44" />
      <circle className="train-car-wheel" cx="15" cy="36" r="3.5" />
      <circle className="train-car-wheel" cx="49" cy="36" r="3.5" />
      <text className="train-car-label" x="32" y="21" textAnchor="middle">
        {label}
      </text>
      {showIndicator ? (
        <g className="train-car-alert" transform="translate(52 4)">
          <circle cx="4" cy="4" r="4" />
          <text x="4" y="6" textAnchor="middle">!</text>
        </g>
      ) : null}
    </svg>
  );
}

export function TrainComposition({
  totalCars,
  selectedCar,
  carsInsights,
  onSelectCar
}: TrainCompositionProps) {
  return (
    <Card title="Komposisi Kereta" eyebrow="Mewakili armada aktif" className="overview-composition-card">
      <div className="train-composition-scroll" aria-label="Komposisi gerbong interaktif">
        <div className="composition overview-car-grid train-composition-track">
        {Array.from({ length: totalCars }, (_, index) => {
          const car = index + 1;
          const isSelected = car === selectedCar;
          const insight = carsInsights.find(c => c.carNumber === car);
          const status = getVisualStatus(insight);
          const anomaly = getAnomalyLabel(insight);
          const statusLabel = status === "no-data" ? "No data" : status.charAt(0).toUpperCase() + status.slice(1);
          const tooltip = [
            `C${car}`,
            `Status: ${statusLabel}`,
            insight ? `Health: ${insight.healthScore}%` : "Health: -",
            anomaly ? `Anomaly: ${anomaly}` : null,
            "Klik untuk memilih gerbong"
          ].filter(Boolean).join("\n");

          return (
            <div className="train-composition-segment" key={car}>
              {car > 1 ? <span className="train-car-connector" aria-hidden="true" /> : null}
              <button
                type="button"
                className={`car-item overview-car-item train-car-link status-${status}${isSelected ? " selected" : ""}`}
                onClick={() => onSelectCar(car)}
                title={tooltip}
                aria-label={`C${car}, Status ${statusLabel}${insight ? `, Health ${insight.healthScore} persen` : ""}${anomaly ? `, Anomaly ${anomaly}` : ""}. Klik untuk memilih gerbong`}
                aria-pressed={isSelected}
              >
                <TrainCarIcon label={`C${car}`} status={status} />
              </button>
            </div>
          );
        })}
        </div>
      </div>
    </Card>
  );
}

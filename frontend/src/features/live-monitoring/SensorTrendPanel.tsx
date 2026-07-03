import { TrendChart } from "@/components/charts/TrendChart";
import { Card } from "@/components/ui/Card";
import type { TelemetrySeries } from "@/types/telemetry";

export function SensorTrendPanel({ series }: { series: TelemetrySeries[] }) {
  const selected = series[0];

  return (
    <Card title="Sensor Trend" eyebrow={`${selected.trainsetId} Car ${selected.carNumber}`}>
      <TrendChart title="Brake Cylinder" values={selected.points.map((point) => point.brakeCylinderBar)} />
    </Card>
  );
}

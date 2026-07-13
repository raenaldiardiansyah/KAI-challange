import type { TelemetrySeries } from "@/types/telemetry";
import { TelemetryChart } from "./TelemetryChart";

export function TelemetryExplorer({ series }: { series: TelemetrySeries[] }) {
  return (
    <div className="stack">
      {series.map((item) => <TelemetryChart key={`${item.trainsetId}-${item.carNumber}`} series={item} />)}
    </div>
  );
}

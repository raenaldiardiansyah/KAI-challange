import type { TelemetrySeries } from "@/types/telemetry";
import { TelemetryChart } from "./TelemetryChart";
import { TelemetryFilter } from "./TelemetryFilter";

export function TelemetryExplorer({ series }: { series: TelemetrySeries[] }) {
  return (
    <div className="stack">
      <TelemetryFilter />
      {series.map((item) => <TelemetryChart key={`${item.trainsetId}-${item.carNumber}`} series={item} />)}
    </div>
  );
}

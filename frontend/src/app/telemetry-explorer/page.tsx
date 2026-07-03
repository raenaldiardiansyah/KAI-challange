import { TelemetryFilter } from "@/features/telemetry/TelemetryFilter";
import { TelemetryChart } from "@/features/telemetry/TelemetryChart";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";
import { getTelemetry } from "@/services/telemetryService";

export default async function TelemetryExplorerPage() {
  const telemetry = await getTelemetry();
  const selectedSeries = telemetry[0];

  return (
    <div className="page-grid telemetry-explorer-layout">
      <section>
        <TelemetryFilter />
      </section>
      
      {selectedSeries ? (
        <section className="telemetry-chart-panel">
          <TelemetryChart series={selectedSeries} />
        </section>
      ) : null}

      <section>
        <TelemetryTable />
      </section>
    </div>
  );
}

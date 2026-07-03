import { MapLibreTrainMap } from "@/components/maps/MapLibreTrainMap";
import { Card } from "@/components/ui/Card";
import type { OverviewData } from "@/services/overviewService";

export function LiveTrainMap({ points }: { points: OverviewData["mapPoints"] }) {
  return (
    <Card title="Peta Posisi Kereta (Live)" eyebrow="Pemantauan Geo-lokasi" className="live-map-card">
      <div className="live-map-frame">
        <MapLibreTrainMap points={points} variant="full" />
      </div>
    </Card>
  );
}

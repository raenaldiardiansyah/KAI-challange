import { Card } from "@/components/ui/Card";
import type { OverviewData } from "@/services/overviewService";
import { LiveTrainMapClient } from "./LiveTrainMapClient";

export function LiveTrainMap({ points }: { points: OverviewData["mapPoints"] }) {
  return (
    <Card title="Peta Posisi Kereta (Live)" eyebrow="Pemantauan Geo-lokasi" className="live-map-card">
      <div className="live-map-frame">
        <LiveTrainMapClient points={points} variant="full" />
      </div>
    </Card>
  );
}

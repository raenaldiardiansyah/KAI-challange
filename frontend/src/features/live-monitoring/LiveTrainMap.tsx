import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import type { OverviewData } from "@/services/overviewService";

const MapLibreTrainMap = dynamic(
  () => import("@/components/maps/MapLibreTrainMap").then((mod) => mod.MapLibreTrainMap),
  { ssr: false, loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>Memuat Peta...</div> }
);

export function LiveTrainMap({ points }: { points: OverviewData["mapPoints"] }) {
  return (
    <Card title="Peta Posisi Kereta (Live)" eyebrow="Pemantauan Geo-lokasi" className="live-map-card">
      <div className="live-map-frame">
        <MapLibreTrainMap points={points} variant="full" />
      </div>
    </Card>
  );
}

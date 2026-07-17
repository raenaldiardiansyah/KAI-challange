"use client";

import dynamic from "next/dynamic";
import type { OverviewData } from "@/services/overviewService";
import type { TrainMapPoint } from "@/components/maps/MapLibreTrainMap";

const MapLibreTrainMap = dynamic(
  () =>
    import("@/components/maps/MapLibreTrainMap").then(
      (mod) => mod.MapLibreTrainMap
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        Memuat Peta...
      </div>
    ),
  }
);

export function LiveTrainMapClient({
  onPointSelect,
  points,
  selectedTrainsetId,
  variant = "full",
}: {
  onPointSelect?: (point: TrainMapPoint) => void;
  points: OverviewData["mapPoints"];
  selectedTrainsetId?: string | null;
  variant?: "mini" | "full";
}) {
  return (
    <MapLibreTrainMap
      onPointSelect={onPointSelect}
      points={points}
      selectedTrainsetId={selectedTrainsetId}
      variant={variant}
    />
  );
}

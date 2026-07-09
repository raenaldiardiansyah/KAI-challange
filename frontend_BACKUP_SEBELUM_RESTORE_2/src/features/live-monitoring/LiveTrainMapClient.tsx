"use client";

import dynamic from "next/dynamic";
import type { OverviewData } from "@/services/overviewService";

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
  points,
  variant = "full",
}: {
  points: OverviewData["mapPoints"];
  variant?: "mini" | "full";
}) {
  return <MapLibreTrainMap points={points} variant={variant} />;
}

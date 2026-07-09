"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { TrainMapPoint } from "@/components/maps/MapLibreTrainMap";

const MapLibreTrainMap = dynamic(
  () => import("@/components/maps/MapLibreTrainMap").then((mod) => mod.MapLibreTrainMap),
  { ssr: false, loading: () => <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>Memuat Peta...</div> }
);

const ROUTES_PER_PAGE = 2;
const PRIORITY_STATUSES = new Set(["Warning", "Alarm", "High", "High Risk", "Data Limited", "Offline"]);

function isPriorityPoint(point: TrainMapPoint) {
  return PRIORITY_STATUSES.has(point.status ?? "") || (point.health ?? 100) < 70;
}

function getRouteToneClass(status?: string) {
  switch (status) {
    case "Warning":
      return "priority-route-card warning";
    case "Alarm":
    case "High":
    case "High Risk":
      return "priority-route-card alarm";
    case "Data Limited":
      return "priority-route-card data-limited";
    case "Offline":
      return "priority-route-card offline";
    default:
      return "priority-route-card watch";
  }
}

export function TrainPositionMap({ points }: { points: TrainMapPoint[] }) {
  const priorityPoints = points.filter(isPriorityPoint);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(priorityPoints.length / ROUTES_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * ROUTES_PER_PAGE;
  const visibleRoutes = priorityPoints.slice(start, start + ROUTES_PER_PAGE);

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(0, Math.min(currentPage, pageCount - 1) - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(pageCount - 1, Math.min(currentPage, pageCount - 1) + 1));
  };

  return (
    <Card title="Mini Map Prioritas" eyebrow="Armada yang perlu perhatian" className="overview-map-card">
      {priorityPoints.length > 0 ? (
        <>
          <Link className="map-preview-link" href="/live-monitoring" aria-label="Buka Pantauan Langsung">
            <MapLibreTrainMap points={priorityPoints} variant="mini" />
          </Link>
          <div className="map-legend-row" aria-label="Legenda status peta">
            <span><i className="legend-dot legend-warning" /> Waspada</span>
            <span><i className="legend-dot legend-danger" /> Alarm</span>
            <span><i className="legend-dot legend-limited" /> Data Terbatas</span>
            <span><i className="legend-dot legend-offline" /> Offline</span>
          </div>
        </>
      ) : (
        <div className="overview-map-empty">
          <strong>Tidak ada armada prioritas</strong>
          <span>Semua armada aktif berada dalam status normal. Pantauan penuh tetap tersedia di Live Monitoring.</span>
        </div>
      )}
      <div className="map-route-legend">
        <div className="map-route-legend-header">
          <strong>Rute Prioritas</strong>
          {pageCount > 1 ? <small>{safePage + 1}/{pageCount}</small> : null}
        </div>
        <div className="map-route-list">
          {visibleRoutes.map((point) => (
            <Link 
              href={`/trainset?id=${point.trainsetId}`}
              className={`map-route-item ${getRouteToneClass(point.status)}`} 
              key={point.trainsetId}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
            >
              <div className="map-route-item-head">
                <strong>{point.trainsetId}</strong>
                <span className="map-route-status"> {point.status ?? "Normal"}</span>
              </div>
              <span>{point.route ?? "Rute belum tersedia"}</span>
              <small>{point.label}</small>
            </Link>
          ))}
          {priorityPoints.length === 0 ? (
            <div className="overview-empty-state">
              <strong>Rute prioritas kosong</strong>
              <span>Tidak ada status Warning, Alarm, High Risk, Data Limited, atau Offline.</span>
            </div>
          ) : null}
        </div>
        {priorityPoints.length > 0 ? (
          <div className="map-route-pagination" aria-label="Paginasi rute minimap">
            <button onClick={goToPreviousPage} disabled={safePage === 0}>Sebelumnya</button>
            <button onClick={goToNextPage} disabled={safePage >= pageCount - 1}>Berikutnya</button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

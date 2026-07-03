"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MapLibreTrainMap, type TrainMapPoint } from "@/components/maps/MapLibreTrainMap";

const ROUTES_PER_PAGE = 2;

export function TrainPositionMap({ points }: { points: TrainMapPoint[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(points.length / ROUTES_PER_PAGE));
  const start = page * ROUTES_PER_PAGE;
  const visibleRoutes = points.slice(start, start + ROUTES_PER_PAGE);

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(0, currentPage - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(pageCount - 1, currentPage + 1));
  };

  return (
    <Card title="Mini Map Posisi Kereta" eyebrow="Preview operasional">
      <Link className="map-preview-link" href="/live-monitoring" aria-label="Buka Pantauan Langsung">
        <MapLibreTrainMap points={points} variant="mini" />
        <span className="map-preview-cta">Buka Pantauan Langsung</span>
      </Link>
      <div className="map-legend-row" aria-label="Legenda status peta">
        <span><i className="legend-dot legend-warning" /> Waspada</span>
        <span><i className="legend-dot legend-watch" /> Pantau</span>
        <span><i className="legend-dot legend-limited" /> Data Terbatas</span>
        <span><i className="legend-line legend-rail" /> Jalur kuning: koridor rel utama</span>
      </div>
      <div className="map-route-legend">
        <div className="map-route-legend-header">
          <strong>Rute Trainset</strong>
          {pageCount > 1 ? <small>{page + 1}/{pageCount}</small> : null}
        </div>
        <div className="map-route-list">
          {visibleRoutes.map((point) => (
            <div className="map-route-item" key={point.trainsetId}>
              <strong>{point.trainsetId}</strong>
              <span>{point.route ?? "Rute belum tersedia"}</span>
              <small>{point.label}</small>
            </div>
          ))}
        </div>
        {pageCount > 1 ? (
          <div className="map-route-pagination" aria-label="Paginasi rute minimap">
            <button onClick={goToPreviousPage} disabled={page === 0}>Sebelumnya</button>
            <button onClick={goToNextPage} disabled={page >= pageCount - 1}>Berikutnya</button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

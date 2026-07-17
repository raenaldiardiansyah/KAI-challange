"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export type TrainMapPoint = {
  trainsetId: string;
  lat: number;
  lng: number;
  label: string;
  trainName?: string;
  route?: string;
  status?: string;
  health?: number;
  lastUpdate?: string;
};

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    cartoLight: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; CartoDB"
    },
    openrailway: {
      type: "raster",
      tiles: ["https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenRailwayMap"
    }
  },
  layers: [
    {
      id: "cartoLight",
      type: "raster",
      source: "cartoLight"
    },
    {
      id: "openrailway",
      type: "raster",
      source: "openrailway"
    }
  ]
};

function getStatusColor(status?: string) {
  switch (status) {
    case "Normal": return "#10b981"; // green
    case "Watch": return "#3b82f6"; // blue
    case "Warning": return "#f59e0b"; // orange
    case "Alarm":
    case "High": return "#ef4444"; // red
    case "Data Limited": return "#9ca3af"; // gray
    case "Offline": return "#4b5563"; // dark gray
    default: return "#10b981";
  }
}

type MapLibreTrainMapProps = {
  points: TrainMapPoint[];
  variant?: "mini" | "full";
  className?: string;
  selectedTrainsetId?: string | null;
  onPointSelect?: (point: TrainMapPoint) => void;
};

export function MapLibreTrainMap({
  points,
  variant = "full",
  className = "",
  selectedTrainsetId,
  onPointSelect,
}: MapLibreTrainMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = points[0] ? [points[0].lng, points[0].lat] as [number, number] : [107.61, -6.92] as [number, number];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center,
      zoom: 6,
      minZoom: 6,
      interactive: variant === "full",
      maxBounds: [
        [104.5, -9.0], // Southwest coordinates (Longitude, Latitude)
        [115.0, -5.5]  // Northeast coordinates (Longitude, Latitude)
      ],
      attributionControl: false
    });

    if (variant === "full") {
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points, variant]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => {
      const bgColor = getStatusColor(point.status);
      const markerElement = document.createElement("div");
      markerElement.className = selectedTrainsetId === point.trainsetId ? "train-marker selected" : "train-marker";
      markerElement.style.backgroundColor = bgColor;
      markerElement.style.borderColor = "#ffffff";
      markerElement.textContent = point.trainsetId;
      markerElement.addEventListener("click", () => onPointSelect?.(point));

      const mockAlarmCount = point.status === "Warning" ? 3 : (point.status === "Watch" ? 1 : (point.status === "Alarm" || point.status === "High" ? 5 : 0));

      const popupHTML = `
        <div style="font-size: 13px; line-height: 1.45; color: #1f2937; min-width: 220px; padding: 4px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 800; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
            ${point.trainsetId} - ${point.trainName || "Tidak diketahui"}
          </h3>
          <p style="margin: 0 0 4px;"><strong>Status:</strong> <span style="color: ${bgColor}; font-weight: 800;">${point.status || "Normal"}</span></p>
          <p style="margin: 0 0 4px;"><strong>Health:</strong> ${point.health || 100}%</p>
          <p style="margin: 0 0 4px;"><strong>Alarm:</strong> ${mockAlarmCount}</p>
          <p style="margin: 0 0 8px;"><strong>Update:</strong> ${point.lastUpdate || "-"}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
            <span style="background: #162340; border-radius: 7px; color: #fff; font-size: 12px; font-weight: 800; padding: 6px 8px;">Pilih Kereta</span>
            <a href="/alarm-center?trainset=${encodeURIComponent(point.trainsetId)}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 7px; color: #162340; font-size: 12px; font-weight: 800; padding: 5px 8px; text-decoration: none;">Buka Alarm</a>
            <a href="/trainset?trainset=${encodeURIComponent(point.trainsetId)}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 7px; color: #162340; font-size: 12px; font-weight: 800; padding: 5px 8px; text-decoration: none;">Detail Armada</a>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(popupHTML);

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([point.lng, point.lat])
        .addTo(map);

      if (variant === "full") {
        marker.setPopup(popup);
      }

      markersRef.current.push(marker);
      bounds.extend([point.lng, point.lat]);
    });

    if (!bounds.isEmpty()) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: variant === "mini" ? 36 : 80, maxZoom: variant === "mini" ? 7 : 8, duration: 800 });
        }
      }, 100);
    }
  }, [points, selectedTrainsetId, onPointSelect, variant]);

  return (
    <div className={`train-map-shell train-map-${variant} ${className}`}>
      <div className="maplibre-panel" ref={containerRef} />
    </div>
  );
}

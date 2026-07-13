"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const TRAIN_MARKER_SOURCE_ID = "kai-train-marker-source";
const TRAIN_MARKER_CIRCLE_LAYER_ID = "kai-train-marker-circle";
const TRAIN_MARKER_ICON_LAYER_ID = "kai-train-marker-icon";
const TRAIN_MARKER_IMAGE_ID = "kai-train-marker-glyph";

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
  speed?: number | null;
  alarmCount?: number | null;
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

function escapeHtml(value?: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildMarkerHTML(point: TrainMapPoint, isSelected: boolean, isFollowing: boolean, color: string) {
  const label = escapeHtml(point.trainsetId);
  const stateClass = [
    "train-marker-card",
    isSelected ? "selected" : "",
    isFollowing ? "following" : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${stateClass}" style="--train-marker-color: ${color};">
      <div class="train-marker-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M7 3h10a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3h-.6l1.6 2.5h-2.2l-.8-1.3H9l-.8 1.3H6l1.6-2.5H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v4h12V6a1 1 0 0 0-1-1H7Zm-.8 8.8a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 0 0-3.4 0Zm8.2 0a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <div class="train-marker-label">${label}</div>
      <div class="train-marker-motion" aria-hidden="true">&gt;</div>
    </div>
  `;
}

function buildPopupHTML(point: TrainMapPoint) {
  const bgColor = getStatusColor(point.status);
  const speed = point.speed == null ? "Kecepatan tidak tersedia" : `${point.speed} km/jam`;
  const alarmCount = point.alarmCount == null ? "Tidak tersedia" : String(point.alarmCount);

  return `
    <div style="font-size: 13px; line-height: 1.45; color: #1f2937; min-width: 220px; padding: 4px;">
      <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 800; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
        ${point.trainsetId} - ${point.trainName || "Tidak diketahui"}
      </h3>
      <p style="margin: 0 0 4px;"><strong>Status:</strong> <span style="color: ${bgColor}; font-weight: 800;">${point.status || "Normal"}</span></p>
      <p style="margin: 0 0 4px;"><strong>Health:</strong> ${point.health ?? "Tidak tersedia"}${point.health == null ? "" : "%"}</p>
      <p style="margin: 0 0 4px;"><strong>Kecepatan:</strong> ${speed}</p>
      <p style="margin: 0 0 4px;"><strong>Alarm:</strong> ${alarmCount}</p>
      <p style="margin: 0 0 8px;"><strong>Update:</strong> ${point.lastUpdate || "-"}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
        <span style="background: #162340; border-radius: 7px; color: #fff; font-size: 12px; font-weight: 800; padding: 6px 8px;">Pilih Kereta</span>
        <a href="/alarm-center?trainset=${encodeURIComponent(point.trainsetId)}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 7px; color: #162340; font-size: 12px; font-weight: 800; padding: 5px 8px; text-decoration: none;">Buka Alarm</a>
        <a href="/trainset?trainset=${encodeURIComponent(point.trainsetId)}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 7px; color: #162340; font-size: 12px; font-weight: 800; padding: 5px 8px; text-decoration: none;">Detail Armada</a>
      </div>
    </div>
  `;
}

function getValidLngLat(point: TrainMapPoint): [number, number] | null {
  const lng = Number(point.lng);
  const lat = Number(point.lat);
  const isIndonesiaLng = lng >= 95 && lng <= 141;
  const isIndonesiaLat = lat >= -11 && lat <= 6;

  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !isIndonesiaLng || !isIndonesiaLat) {
    return null;
  }

  return [lng, lat];
}

function createTrainIconImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.clearRect(0, 0, 32, 32);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(9, 5, 14, 18, 4);
  context.fill();
  context.fillStyle = "#162340";
  context.fillRect(11, 8, 10, 5);
  context.beginPath();
  context.arc(13, 18, 2, 0, Math.PI * 2);
  context.arc(19, 18, 2, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(12, 24);
  context.lineTo(9, 28);
  context.moveTo(20, 24);
  context.lineTo(23, 28);
  context.stroke();

  return context.getImageData(0, 0, 32, 32);
}

function buildCanvasMarkerData(points: TrainMapPoint[], selectedTrainsetId?: string | null, followTrainsetId?: string | null) {
  return {
    type: "FeatureCollection" as const,
    features: points.flatMap((point) => {
      const lngLat = getValidLngLat(point);
      if (!lngLat) return [];

      return [{
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: lngLat,
        },
        properties: {
          color: getStatusColor(point.status),
          following: followTrainsetId === point.trainsetId,
          selected: selectedTrainsetId === point.trainsetId,
          trainsetId: point.trainsetId,
        },
      }];
    }),
  };
}

function ensureCanvasMarkerLayer(map: maplibregl.Map, markerData: ReturnType<typeof buildCanvasMarkerData>) {
  if (!map.hasImage(TRAIN_MARKER_IMAGE_ID)) {
    const image = createTrainIconImage();
    if (image) {
      map.addImage(TRAIN_MARKER_IMAGE_ID, image);
    }
  }

  if (!map.getSource(TRAIN_MARKER_SOURCE_ID)) {
    map.addSource(TRAIN_MARKER_SOURCE_ID, {
      type: "geojson",
      data: markerData,
    });
  }

  if (!map.getLayer(TRAIN_MARKER_CIRCLE_LAYER_ID)) {
    map.addLayer({
      id: TRAIN_MARKER_CIRCLE_LAYER_ID,
      type: "circle",
      source: TRAIN_MARKER_SOURCE_ID,
      paint: {
        "circle-color": ["get", "color"],
        "circle-opacity": 0.96,
        "circle-radius": ["case", ["get", "following"], 22, ["get", "selected"], 20, 18],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": ["case", ["get", "following"], 5, 4],
      },
    });
  }

  if (!map.getLayer(TRAIN_MARKER_ICON_LAYER_ID) && map.hasImage(TRAIN_MARKER_IMAGE_ID)) {
    map.addLayer({
      id: TRAIN_MARKER_ICON_LAYER_ID,
      type: "symbol",
      source: TRAIN_MARKER_SOURCE_ID,
      layout: {
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-image": TRAIN_MARKER_IMAGE_ID,
        "icon-size": ["case", ["get", "following"], 0.82, 0.72],
      },
    });
  }

  const source = map.getSource(TRAIN_MARKER_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  source?.setData(markerData);
}

type MapLibreTrainMapProps = {
  points: TrainMapPoint[];
  variant?: "mini" | "full";
  className?: string;
  focusRevision?: number;
  followTrainsetId?: string | null;
  selectedTrainsetId?: string | null;
  onPointSelect?: (point: TrainMapPoint) => void;
};

export function MapLibreTrainMap({
  focusRevision = 0,
  followTrainsetId,
  points,
  variant = "full",
  className = "",
  selectedTrainsetId,
  onPointSelect,
}: MapLibreTrainMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, { element: HTMLDivElement; marker: maplibregl.Marker; popup?: maplibregl.Popup }>>(new Map());
  const lastBoundsKeyRef = useRef("");
  const lastFocusRevisionRef = useRef(focusRevision);
  const [initialCenter] = useState<[number, number]>(() => points[0] ? getValidLngLat(points[0]) ?? [107.61, -6.92] : [107.61, -6.92]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: initialCenter,
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
  }, [initialCenter, variant]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = new maplibregl.LngLatBounds();
    const visibleIds = new Set(points.map((point) => point.trainsetId));
    const markerData = buildCanvasMarkerData(points, selectedTrainsetId, followTrainsetId);
    const syncCanvasMarkers = () => ensureCanvasMarkerLayer(map, markerData);

    if (map.isStyleLoaded()) {
      syncCanvasMarkers();
    } else {
      map.once("load", syncCanvasMarkers);
    }

    markersRef.current.forEach((entry, trainsetId) => {
      if (!visibleIds.has(trainsetId)) {
        entry.marker.remove();
        markersRef.current.delete(trainsetId);
      }
    });

    points.forEach((point) => {
      const bgColor = getStatusColor(point.status);
      let entry = markersRef.current.get(point.trainsetId);

      if (!entry) {
        const markerElement = document.createElement("div");
        markerElement.classList.add("train-marker-anchor");
        markerElement.style.alignItems = "center";
        markerElement.style.display = "flex";
        markerElement.style.height = "48px";
        markerElement.style.justifyContent = "center";
        markerElement.style.pointerEvents = "auto";
        markerElement.style.visibility = "visible";
        markerElement.style.width = "124px";
        markerElement.style.zIndex = "70";

        const popup = variant === "full"
          ? new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(buildPopupHTML(point))
          : undefined;

        const lngLat = getValidLngLat(point);
        if (!lngLat) return;

        const marker = new maplibregl.Marker({ element: markerElement, anchor: "center" })
          .setLngLat(lngLat)
          .addTo(map);

        if (popup) {
          marker.setPopup(popup);
        }

        entry = { element: markerElement, marker, popup };
        markersRef.current.set(point.trainsetId, entry);
      }

      const isSelected = selectedTrainsetId === point.trainsetId;
      const isFollowing = followTrainsetId === point.trainsetId;
      const lngLat = getValidLngLat(point);
      if (!lngLat) return;

      entry.element.classList.add("train-marker-anchor");
      entry.element.innerHTML = buildMarkerHTML(point, isSelected, isFollowing, bgColor);
      entry.element.title = isFollowing
        ? `${point.trainsetId} sedang diikuti dan bergerak`
        : `${point.trainsetId} - klik untuk pilih kereta`;
      entry.element.onclick = () => onPointSelect?.(point);
      entry.marker.setLngLat(lngLat);
      entry.popup?.setHTML(buildPopupHTML(point));
      bounds.extend(lngLat);
    });

    const followedPoint = followTrainsetId
      ? points.find((point) => point.trainsetId === followTrainsetId)
      : undefined;

    if (followedPoint && variant === "full") {
      map.easeTo({
        center: getValidLngLat(followedPoint) ?? [followedPoint.lng, followedPoint.lat],
        duration: 1200,
        essential: true,
        zoom: Math.max(map.getZoom(), 8),
      });
      return;
    }

    const boundsKey = points.map((point) => point.trainsetId).sort().join("|");
    const shouldFitBounds =
      boundsKey !== lastBoundsKeyRef.current ||
      focusRevision !== lastFocusRevisionRef.current;

    if (!bounds.isEmpty() && shouldFitBounds) {
      lastBoundsKeyRef.current = boundsKey;
      lastFocusRevisionRef.current = focusRevision;
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: variant === "mini" ? 36 : 80, maxZoom: variant === "mini" ? 7 : 8, duration: 800 });
        }
      }, 100);
    }

    return () => {
      map.off("load", syncCanvasMarkers);
    };
  }, [focusRevision, followTrainsetId, points, selectedTrainsetId, onPointSelect, variant]);

  return (
    <div className={`train-map-shell train-map-${variant} ${className}`}>
      <div className="maplibre-panel" ref={containerRef} />
    </div>
  );
}

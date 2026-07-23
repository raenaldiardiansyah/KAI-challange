"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ArrowsOut,
  Bell,
  Broadcast,
  CaretDown,
  CaretUp,
  Crosshair,
  FunnelSimple,
  Gauge,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  Minus,
  NavigationArrow,
  Pause,
  Play,
  Plus,
  Pulse,
  Stack,
  Train,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { LiveTrainMapClient } from "@/features/live-monitoring/LiveTrainMapClient";
import type { OverviewData } from "@/services/overviewService";
import { formatDate } from "@/utils/formatDate";

type LiveMonitoringWorkspaceProps = {
  points: OverviewData["mapPoints"];
  trainsets: OverviewData["trainsets"];
  isDummy?: boolean;
};

type ConnectionFilter = "all" | "connected" | "moving" | "warning" | "stale";
type HealthFilter = "All" | "Normal" | "Watch" | "Warning" | "Data Limited";
type MapMode = "Live" | "Riwayat" | "Kepadatan";

const healthFilters: Array<{ label: string; value: HealthFilter }> = [
  { label: "Semua", value: "All" },
  { label: "Normal", value: "Normal" },
  { label: "Pantau", value: "Watch" },
  { label: "Warning", value: "Warning" },
  { label: "Data Terlambat", value: "Data Limited" },
];

const mapModes: MapMode[] = ["Live", "Riwayat", "Kepadatan"];

const priorityCarByTrainset: Record<string, { car: number; subsystem: string }> = {
  "TS-001": { car: 5, subsystem: "Brake System" },
  "TS-002": { car: 2, subsystem: "Genset" },
  "TS-003": { car: 7, subsystem: "Door" },
};

const movementProfile: Record<string, { lat: number; lng: number; phase: number }> = {
  "TS-001": { lat: 0.0012, lng: 0.0026, phase: 0 },
  "TS-002": { lat: -0.001, lng: 0.0022, phase: 1.7 },
  "TS-003": { lat: 0.0014, lng: -0.0018, phase: 3.2 },
};

function formatLiveTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LiveMonitoringWorkspace({ points, trainsets, isDummy = false }: LiveMonitoringWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [simulatedPoints, setSimulatedPoints] = useState(points);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("trainset") ?? points[0]?.trainsetId ?? null);
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("All");
  const [mode, setMode] = useState<MapMode>("Live");
  const [query, setQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [isPlaybackRunning, setIsPlaybackRunning] = useState(false);
  const [focusRevision, setFocusRevision] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [layer, setLayer] = useState<"rail" | "traffic">("rail");

  useEffect(() => {
    if (!isDummy) return;
    let movementTick = 0;
    const timer = window.setInterval(() => {
      movementTick += 1;

      setSimulatedPoints((currentPoints) =>
        currentPoints.map((point) => {
          const profile = movementProfile[point.trainsetId] ?? { lat: 0.001, lng: 0.001, phase: 0 };
          const wave = Math.sin((movementTick + profile.phase) / 3);

          return {
            ...point,
            lat: Number((point.lat + profile.lat + wave * 0.00025).toFixed(6)),
            lng: Number((point.lng + profile.lng + wave * 0.0003).toFixed(6)),
            lastUpdate: formatLiveTime(new Date()),
          };
        })
      );
    }, 1600);

    return () => window.clearInterval(timer);
  }, [isDummy, points]);

  const displayPoints = isDummy ? simulatedPoints : points;

  const trainById = useMemo(() => new Map(trainsets.map((trainset) => [trainset.id, trainset])), [trainsets]);

  const searchablePoints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return displayPoints.filter((point) => {
      const trainset = trainById.get(point.trainsetId);
      return (
        point.trainsetId.toLowerCase().includes(normalizedQuery) ||
        (point.trainName ?? "").toLowerCase().includes(normalizedQuery) ||
        (point.route ?? "").toLowerCase().includes(normalizedQuery) ||
        point.label.toLowerCase().includes(normalizedQuery) ||
        (trainset?.location ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [displayPoints, query, trainById]);

  const filteredPoints = useMemo(() => {
    return displayPoints.filter((point) => {
      const trainset = trainById.get(point.trainsetId);
      if (!trainset) return false;

      const matchesConnection =
        connectionFilter === "all" ||
        (connectionFilter === "connected" && trainset.online) ||
        (connectionFilter === "moving" && (point.speed ?? 0) > 0) ||
        (connectionFilter === "warning" && trainset.healthStatus === "Warning") ||
        (connectionFilter === "stale" && trainset.dataStatus !== "Online");

      const matchesHealth =
        healthFilter === "All" ||
        point.status === healthFilter ||
        trainset.healthStatus === healthFilter ||
        (healthFilter === "Data Limited" && trainset.dataStatus !== "Online");

      return matchesConnection && matchesHealth;
    });
  }, [connectionFilter, healthFilter, displayPoints, trainById]);

  const selectedPoint = selectedId
    ? displayPoints.find((point) => point.trainsetId === selectedId)
    : undefined;
  const selectedTrainset = selectedPoint ? trainById.get(selectedPoint.trainsetId) : undefined;

  const connectedCount = trainsets.filter((trainset) => trainset.online).length;
  const movingCount = displayPoints.filter((point) => (point.speed ?? 0) > 0).length;
  const warningCount = trainsets.filter((trainset) => trainset.healthStatus === "Warning").length;
  const staleCount = trainsets.filter((trainset) => trainset.dataStatus !== "Online").length;

  const handleSelectTrain = (id: string) => {
    const nextPoint = displayPoints.find((point) => point.trainsetId === id);
    setSelectedId(id);
    setIsFollowing(false);
    setIsDockExpanded(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("trainset", id);
    router.replace(`?${params.toString()}`, { scroll: false });
    if (nextPoint) {
      setQuery(nextPoint.trainName ?? nextPoint.trainsetId);
    }
  };

  const clearFilters = () => {
    setConnectionFilter("all");
    setHealthFilter("All");
    setQuery("");
  };

  return (
    <div className="live-workspace">
      <div className="live-command-bar">
        <div className="live-status-strip" aria-label="Status koneksi armada">
          <StatusFilterButton active={connectionFilter === "connected"} count={connectedCount} label="Terhubung" onClick={() => setConnectionFilter("connected")} />
          <StatusFilterButton active={connectionFilter === "moving"} count={movingCount} label="Bergerak" onClick={() => setConnectionFilter("moving")} />
          <StatusFilterButton active={connectionFilter === "warning"} count={warningCount} label="Warning" onClick={() => setConnectionFilter("warning")} />
          <StatusFilterButton active={connectionFilter === "stale"} count={staleCount} label="Data Terlambat" onClick={() => setConnectionFilter("stale")} />
        </div>

        <div className="live-search-wrap">
          <MagnifyingGlass size={16} />
          <input
            aria-label="Cari trainset, nama kereta, rute, atau lokasi"
            className="input-control live-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari trainset, nama kereta, rute, atau lokasi"
            value={query}
          />
          {query.trim() ? (
            <button aria-label="Bersihkan pencarian" onClick={() => setQuery("")} type="button">
              Bersihkan
            </button>
          ) : null}
          {searchablePoints.length > 0 ? (
            <div className="live-search-results">
              {searchablePoints.map((point) => (
                <button key={point.trainsetId} onClick={() => handleSelectTrain(point.trainsetId)} type="button">
                  <strong>{point.trainsetId} - {point.trainName}</strong>
                  <span>{point.route} - {point.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="live-filter-pills" aria-label="Filter kesehatan kereta">
          {healthFilters.map((filter) => (
            <button
              className={healthFilter === filter.value ? "active" : ""}
              key={filter.value}
              onClick={() => setHealthFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="live-filter-pills mode" aria-label="Mode peta">
          {mapModes.map((item) => (
            <button className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)} type="button">
              {item}{!isDummy && item !== "Live" ? " · Prototype" : ""}
            </button>
          ))}
        </div>

        {(connectionFilter !== "all" || healthFilter !== "All" || query.trim()) ? (
          <button className="live-clear-filter" onClick={clearFilters} type="button">
            <FunnelSimple size={14} />
            Reset filter
          </button>
        ) : null}
      </div>

      <section className="live-operational-grid">
        <div className="live-map-stage">
          <LiveTrainMapClient
            focusRevision={focusRevision}
            followTrainsetId={isFollowing ? selectedPoint?.trainsetId ?? null : null}
            points={filteredPoints}
            selectedTrainsetId={selectedPoint?.trainsetId ?? null}
            onPointSelect={(point) => handleSelectTrain(point.trainsetId)}
            variant="full"
          />

          <div className="live-map-tools">
            <Button
              icon={<Crosshair size={16} />}
              onClick={() => {
                setSelectedId(null);
                router.replace("/live-monitoring", { scroll: false });
                setIsFollowing(false);
                setIsDockExpanded(false);
                setConnectionFilter("all");
                setHealthFilter("All");
                setQuery("");
                setFocusRevision((value) => value + 1);
              }}
              variant="secondary"
            >
              Fokus Semua
            </Button>
            <Button
              disabled={!selectedPoint}
              icon={<MapTrifold size={16} />}
              onClick={() => setIsFollowing((value) => !value)}
              title={!selectedPoint ? "Pilih kereta terlebih dahulu" : undefined}
              variant={isFollowing ? "primary" : "secondary"}
            >
              {isFollowing ? "Berhenti Mengikuti" : "Ikuti Kereta"}
            </Button>
          </div>

          <div className="live-map-icon-tools" aria-label="Kontrol peta">
            <button onClick={() => setZoomLevel((value) => Math.min(value + 1, 10))} title="Zoom masuk" type="button"><Plus size={16} /></button>
            <button onClick={() => setZoomLevel((value) => Math.max(value - 1, 5))} title="Zoom keluar" type="button"><Minus size={16} /></button>
            <button onClick={() => selectedPoint && handleSelectTrain(selectedPoint.trainsetId)} title="Posisi kereta terpilih" type="button"><NavigationArrow size={16} /></button>
            <button onClick={() => setZoomLevel(6)} title="Reset orientasi" type="button"><ArrowsClockwise size={16} /></button>
            <button onClick={() => setLayer((value) => value === "rail" ? "traffic" : "rail")} title="Ganti layer" type="button"><Stack size={16} /></button>
            <button onClick={() => setIsDockExpanded((value) => !value)} title="Perbesar panel detail" type="button"><ArrowsOut size={16} /></button>
          </div>

          <div className="live-map-meta">
            <span>Mode {mode}</span>
            <span>Zoom {zoomLevel}</span>
            <span>Layer {layer === "rail" ? "Rel" : "Operasional"}</span>
            <span>{filteredPoints.length} hasil</span>
          </div>

          {mode === "Riwayat" ? (
            <HistoryPanel isRunning={isPlaybackRunning} onToggle={() => setIsPlaybackRunning((value) => !value)} />
          ) : null}

          {mode === "Kepadatan" ? <DensityPanel points={filteredPoints} trainsets={trainsets} /> : null}

          {selectedPoint && selectedTrainset ? (
            <BottomDock
              expanded={isDockExpanded}
              onClose={() => {
                setSelectedId(null);
                router.replace("/live-monitoring", { scroll: false });
                setIsDockExpanded(false);
              }}
              onToggle={() => setIsDockExpanded((value) => !value)}
              point={selectedPoint}
              trainset={selectedTrainset}
            />
          ) : null}
        </div>

        <aside className="live-context-panel">
          {selectedPoint && selectedTrainset ? (
            <LiveTrainDetail
              isFollowing={isFollowing}
              point={selectedPoint}
              trainset={selectedTrainset}
              onBack={() => {
                setSelectedId(null);
                setQuery("");
                router.replace("/live-monitoring", { scroll: false });
              }}
              onFollow={() => setIsFollowing((value) => !value)}
            />
          ) : (
            <LiveTrainList
              points={filteredPoints}
              selectedId={selectedId}
              trainById={trainById}
              onSelect={handleSelectTrain}
            />
          )}
        </aside>
      </section>
    </div>
  );
}

function StatusFilterButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick} type="button">
      <strong>{count}</strong>
      <span>{label}</span>
    </button>
  );
}

function HistoryPanel({ isRunning, onToggle }: { isRunning: boolean; onToggle: () => void }) {
  return (
    <div className="live-mode-panel history">
      <strong>Riwayat 24 jam</strong>
      <label>
        Tanggal
        <input type="date" defaultValue="2026-07-02" />
      </label>
      <button onClick={onToggle} type="button">
        {isRunning ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
        {isRunning ? "Pause" : "Play"}
      </button>
      <input aria-label="Slider waktu riwayat" type="range" min="0" max="100" defaultValue="62" />
      <span>Kecepatan 2x</span>
    </div>
  );
}

function DensityPanel({ points, trainsets }: { points: OverviewData["mapPoints"]; trainsets: OverviewData["trainsets"] }) {
  const alarmCount = trainsets.reduce((sum, trainset) => sum + trainset.alarmCount, 0);
  const staleCount = trainsets.filter((trainset) => trainset.dataStatus !== "Online").length;

  return (
    <div className="live-mode-panel density">
      <strong>Kepadatan Koridor</strong>
      <span>{points.length} marker aktif</span>
      <span>{alarmCount} alarm</span>
      <span>{staleCount} data terlambat</span>
    </div>
  );
}

function LiveTrainList({
  onSelect,
  points,
  selectedId,
  trainById,
}: {
  onSelect: (id: string) => void;
  points: OverviewData["mapPoints"];
  selectedId: string | null;
  trainById: Map<string, OverviewData["trainsets"][number]>;
}) {
  return (
    <div className="live-panel-card">
      <div className="live-panel-header">
        <div>
          <span>Status Real-time</span>
          <strong>Daftar Kereta Terhubung</strong>
        </div>
        <Train size={18} />
      </div>
      <div className="live-result-count">{points.length} kereta sesuai filter</div>
      <div className="live-train-list">
        {points.map((point) => {
          const trainset = trainById.get(point.trainsetId);
          if (!trainset) return null;

          return (
            <button
              className={selectedId === point.trainsetId ? "live-train-card selected" : "live-train-card"}
              key={point.trainsetId}
              onClick={() => onSelect(point.trainsetId)}
              type="button"
            >
              <span className="live-train-card-head">
                <strong>{trainset.name}</strong>
                <StatusIndicator status={trainset.healthStatus} />
              </span>
              <span>{trainset.route}</span>
              <span className="live-train-card-meta">
                <small>{trainset.location}</small>
                <small>{point.speed == null ? "Kecepatan tidak tersedia" : `${point.speed} km/jam`}</small>
              </span>
              <span className="live-train-card-meta">
                <small>{trainset.alarmCount} alarm aktif</small>
                <small>{point.lastUpdate ?? formatDate(trainset.lastUpdate)}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LiveTrainDetail({
  isFollowing,
  onBack,
  onFollow,
  point,
  trainset,
}: {
  isFollowing: boolean;
  onBack: () => void;
  onFollow: () => void;
  point: OverviewData["mapPoints"][number];
  trainset: OverviewData["trainsets"][number];
}) {
  const priorityCar = priorityCarByTrainset[trainset.id] ?? { car: 1, subsystem: "Brake System" };
  const carUrl = `/car-detail?trainset=${encodeURIComponent(trainset.id)}&car=${priorityCar.car}&subsystem=${encodeURIComponent(priorityCar.subsystem)}`;
  const detailRows = [
    { label: "Posisi", value: point.label },
    { label: "Kecepatan", value: point.speed == null ? "Tidak tersedia" : `${point.speed} km/jam` },
    { label: "Status data", value: trainset.dataStatus },
    { label: "Health", value: `${trainset.healthScore}%` },
    { label: "Alarm aktif", value: `${trainset.alarmCount}` },
    { label: "Update lokasi", value: point.lastUpdate ?? formatDate(trainset.lastUpdate) },
    { label: "Koordinat", value: `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` },
  ];
  const operationalRows = [
    { label: "Rencana perjalanan", value: "Prototype - backend belum menyediakan ETA" },
    { label: "Kualitas koneksi", value: trainset.dataStatus === "Online" ? "Telemetry normal, GPS aktif" : "Telemetry perlu dipantau, data tidak real-time penuh" },
    { label: "Perhatian operator", value: trainset.alarmCount > 0 ? `${trainset.alarmCount} alarm aktif perlu dipantau` : "Tidak ada alarm aktif" },
  ];

  return (
    <div className="live-panel-card detail">
      <div className="live-panel-header">
        <div>
          <span>{trainset.id}</span>
          <strong>{trainset.name}</strong>
        </div>
        <button aria-label="Kembali ke daftar kereta" onClick={onBack} type="button">
          Kembali
        </button>
      </div>

      <div className="live-detail-status">
        <StatusIndicator status={trainset.healthStatus} />
        <span>{trainset.route}</span>
      </div>

      <div className="live-detail-grid">
        {detailRows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="live-detail-operational">
        <div className="live-detail-operational-head">
          <MapPin size={18} weight="fill" />
          <div>
            <span>Ringkasan Operasional</span>
            <strong>{priorityCar.subsystem} - C{priorityCar.car}</strong>
          </div>
        </div>
        {operationalRows.map((row) => (
          <div className="live-detail-operational-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="live-detail-actions">
        <Button icon={<MapTrifold size={16} />} onClick={onFollow} variant={isFollowing ? "primary" : "secondary"}>
          {isFollowing ? "Berhenti Ikuti" : "Ikuti Kereta"}
        </Button>
        <Button asChild icon={<Train size={16} />} variant="secondary">
          <Link href={`/trainset?trainset=${encodeURIComponent(trainset.id)}`}>Lihat Armada</Link>
        </Button>
        <Button asChild icon={<Train size={16} />} variant="secondary">
          <Link href={carUrl}>Lihat Gerbong</Link>
        </Button>
        <Button asChild icon={<Bell size={16} />} variant="secondary">
          <Link href={`/alarm-center?trainset=${encodeURIComponent(trainset.id)}`}>Buka Alarm</Link>
        </Button>
        <Button asChild icon={<Pulse size={16} />} variant="secondary">
          <Link href={`/insight-analytic?trainset=${encodeURIComponent(trainset.id)}`}>Lihat Insight</Link>
        </Button>
        <Button asChild icon={<Gauge size={16} />} variant="secondary">
          <Link href={`/telemetry-explorer?trainset=${encodeURIComponent(trainset.id)}`}>Sensor Mentah</Link>
        </Button>
      </div>
    </div>
  );
}

function BottomDock({
  expanded,
  onClose,
  onToggle,
  point,
  trainset,
}: {
  expanded: boolean;
  onClose: () => void;
  onToggle: () => void;
  point: OverviewData["mapPoints"][number];
  trainset: OverviewData["trainsets"][number];
}) {
  return (
    <div className={expanded ? "live-bottom-dock expanded" : "live-bottom-dock"}>
      <div>
        <span>Kereta</span>
        <strong>{trainset.id} - {trainset.name}</strong>
      </div>
      <div>
        <span>Perjalanan</span>
        <strong>{point.speed == null ? "Kecepatan tidak tersedia" : `${point.speed} km/jam`} · ETA Prototype</strong>
      </div>
      <div>
        <span>Status Operasional</span>
        <strong>{trainset.healthScore}% health - {trainset.alarmCount} alarm</strong>
      </div>
      <div>
        <span>Update</span>
        <strong>{point.lastUpdate ?? formatDate(trainset.lastUpdate)}</strong>
      </div>
      <button aria-label={expanded ? "Ciutkan dock" : "Perluas dock"} onClick={onToggle} type="button">
        {expanded ? <CaretDown size={16} weight="bold" /> : <CaretUp size={16} weight="bold" />}
      </button>
      <button aria-label="Tutup detail kereta" onClick={onClose} type="button">
        Tutup
      </button>
      {expanded ? (
        <div className="live-bottom-dock-extra">
          <div><b>Perjalanan</b><span>{point.label}; ETA dan progres koridor masih Prototype.</span></div>
          <div><b>Koneksi</b><span>GPS 12:30:45; telemetry {trainset.dataStatus}; sinyal stabil.</span></div>
          <div><b>Kondisi</b><span>Gerbong prioritas C{priorityCarByTrainset[trainset.id]?.car ?? 1}; severity {trainset.healthStatus}.</span></div>
          <div><b>Kejadian</b><span>Telemetry masuk, alarm aktif, posisi koridor diperbarui.</span></div>
        </div>
      ) : null}
    </div>
  );
}

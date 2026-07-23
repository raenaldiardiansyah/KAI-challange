"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CarDetail } from "@/types/car";
import type { TelemetrySeries } from "@/types/telemetry";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type CarOperationalOverviewProps = {
  car: CarDetail;
  telemetry?: TelemetrySeries;
  onOpenDataSensor?: () => void;
  onOpenAction?: () => void;
};

type TimelineCategory = "sensor" | "status" | "insight" | "action";
type TimelineFilter = "all" | "important" | TimelineCategory;

type TimelineItem = {
  time: string;
  title: string;
  text: string;
  category: TimelineCategory;
  important: boolean;
};

type TrendMetric = "health" | "brakeCylinder" | "brakePipe";
type SummaryMode = "trend" | "timeline" | "comparison" | "rule" | "action";

function buildTrendData(car: CarDetail, telemetry?: TelemetrySeries) {
  const points = telemetry?.points.length
    ? telemetry.points
    : Array.from({ length: 6 }, (_, index) => ({
        timestamp: `${String(8 + index * 2).padStart(2, "0")}:00`,
        brakePipeBar: Number((car.brakePipeBar + Math.sin(index) * 0.04).toFixed(2)),
        brakeCylinderBar: Number((car.brakeCylinderBar + (5 - index) * 0.08).toFixed(2)),
        temperature: Number((car.hvacTemperature + Math.cos(index) * 0.5).toFixed(1)),
        gensetVoltage: car.gensetVoltage
      }));

  const startHealth = Math.min(98, car.healthScore + 18);
  const steps = Math.max(1, points.length - 1);

  return points.map((point, index) => ({
    time: point.timestamp,
    health: Math.round(startHealth - ((startHealth - car.healthScore) * index) / steps),
    brakeCylinder: point.brakeCylinderBar,
    brakePipe: point.brakePipeBar,
    temperature: point.temperature,
    anomaly: point.brakeCylinderBar < 2 ? 1 : 0
  }));
}

function getRiskTone(score: number) {
  if (score < 60) return "danger";
  if (score < 80) return "warning";
  return "success";
}

export function CarOperationalOverview({ car, telemetry, onOpenDataSensor, onOpenAction }: CarOperationalOverviewProps) {
  const router = useRouter();
  const carCode = car.backendCarId ?? car.id;
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("important");
  const [selectedTimelineKey, setSelectedTimelineKey] = useState("");
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("trend");
  const [activeTrendMetric, setActiveTrendMetric] = useState<TrendMetric>("health");
  const trendData = buildTrendData(car, telemetry);
  const mainSubsystem = [...car.subsystems].sort((a, b) => a.healthScore - b.healthScore)[0];
  const anomalyMinutes = Math.max(12, trendData.filter((point) => point.anomaly).length * 9);
  const firstTrendPoint = trendData[0];
  const lastTrendPoint = trendData[trendData.length - 1];
  const healthDelta = firstTrendPoint && lastTrendPoint ? lastTrendPoint.health - firstTrendPoint.health : 0;
  const trendDirection = healthDelta < 0 ? "turun" : healthDelta > 0 ? "naik" : "stabil";
  const initialBrakeCylinder = firstTrendPoint?.brakeCylinder ?? car.brakeCylinderBar;
  const lowestBrakeCylinder = Math.min(...trendData.map((point) => point.brakeCylinder));
  const brakeCylinderDelta = car.brakeCylinderBar - initialBrakeCylinder;
  const initialBrakePipe = firstTrendPoint?.brakePipe ?? car.brakePipeBar;
  const averageBrakePipe = trendData.reduce((sum, point) => sum + point.brakePipe, 0) / Math.max(1, trendData.length);
  const brakePipeDelta = car.brakePipeBar - initialBrakePipe;
  const fleetAverage = Math.min(92, Math.max(car.healthScore + 18, 84));
  const tone = getRiskTone(car.healthScore);
  const currentNeed = tone === "danger"
    ? "Prioritaskan inspeksi fisik sebelum kereta melanjutkan perjalanan."
    : tone === "warning"
      ? "Validasi sensor dan bandingkan dengan gerbong referensi sebelum jadwal berikutnya."
      : "Lanjutkan pemantauan rutin dan cek ulang bila tren berubah.";
  const actionSubsystem = mainSubsystem?.subsystem ?? "Brake System";
  const workOrderUrl = `/work-order?trainset=${encodeURIComponent(car.trainsetId)}&car=${encodeURIComponent(carCode)}&subsystem=${encodeURIComponent(actionSubsystem)}`;

  const timeline: TimelineItem[] = [
    { time: "12:38", title: "Pembacaan baseline normal", text: "Brake Pipe stabil dan tidak ada deviasi signifikan pada awal jendela observasi.", category: "sensor", important: false },
    { time: "12:45", title: "Sensor mulai menyimpang", text: `${actionSubsystem} menunjukkan perubahan pola pada ${carCode}.`, category: "sensor", important: true },
    { time: "12:47", title: "Deviasi terdeteksi", text: `Brake Cylinder tercatat ${car.brakeCylinderBar.toFixed(1)} bar dibanding normal 2.1-2.4 bar.`, category: "sensor", important: true },
    { time: "12:50", title: `Status ${car.healthStatus}`, text: `Skor kesehatan gerbong turun ke ${car.healthScore}%.`, category: "status", important: true },
    { time: "12:53", title: "Insight AI dibuat", text: "Sistem menyarankan validasi sensor dan pemeriksaan komponen terkait.", category: "insight", important: true },
    { time: "12:58", title: "Validasi silang disarankan", text: "Bandingkan tekanan dengan gerbong referensi untuk memastikan deviasi bukan noise sensor.", category: "insight", important: false },
    { time: "13:05", title: "Tindakan direkomendasikan", text: "Inspeksi sebelum perjalanan berikutnya agar risiko tidak naik.", category: "action", important: true },
    { time: "13:12", title: "Menunggu tindak lanjut SPK", text: "Belum ada catatan inspeksi baru yang masuk untuk kejadian ini.", category: "action", important: false }
  ];
  const getTimelineKey = (item: TimelineItem) => `${item.time}-${item.title}`;
  const timelinePreview = timeline.filter((item) => item.important).slice(0, 5);
  const importantTimeline = timeline.filter((item) => item.important);
  const filteredTimeline = timeline.filter((item) => {
    if (timelineFilter === "all") return true;
    if (timelineFilter === "important") return item.important;
    return item.category === timelineFilter;
  });
  const selectedTimeline = timeline.find((item) => getTimelineKey(item) === selectedTimelineKey)
    ?? filteredTimeline[0]
    ?? timeline[0];
  const openTimelineDialog = (item: TimelineItem) => {
    setSelectedTimelineKey(getTimelineKey(item));
    setTimelineFilter(item.important ? "important" : item.category);
    setIsTimelineOpen(true);
  };
  const timelineFilters: Array<{ id: TimelineFilter; label: string }> = [
    { id: "important", label: "Penting" },
    { id: "all", label: "Semua" },
    { id: "sensor", label: "Sensor" },
    { id: "status", label: "Status" },
    { id: "insight", label: "Insight" },
    { id: "action", label: "Tindakan" }
  ];
  const summaryModes: Array<{ id: SummaryMode; label: string; helper: string }> = [
    { id: "trend", label: "Tren", helper: "Analisis grafik" },
    { id: "timeline", label: "Timeline", helper: "Urutan kejadian" },
    { id: "comparison", label: "Perbandingan", helper: "Konteks gerbong" },
    { id: "rule", label: "Rule", helper: "Evaluasi RAMS" },
    { id: "action", label: "Tindakan", helper: "Langkah berikutnya" }
  ];

  return (
    <div className="car-operational-overview">
      <div className="car-summary-mode-tabs" role="tablist" aria-label="Mode ringkasan gerbong">
        {summaryModes.map((mode) => (
          <button
            aria-selected={summaryMode === mode.id}
            className={summaryMode === mode.id ? "active" : ""}
            key={mode.id}
            onClick={() => setSummaryMode(mode.id)}
            role="tab"
            type="button"
          >
            <strong>{mode.label}</strong>
            <span>{mode.helper}</span>
          </button>
        ))}
      </div>

      <div className="car-operational-top-grid">
        <Card title="Grafik Tren Kesehatan" eyebrow="24 jam terakhir" className={`car-trend-card${summaryMode === "trend" ? " trend-detail-active" : ""}`}>
          <div
            className="car-trend-frame car-trend-frame-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setSummaryMode("trend")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSummaryMode("trend");
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" strokeWidth={1.3} />
                <XAxis dataKey="time" tick={{ fontSize: 13, fontWeight: 800, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis yAxisId="health" domain={[0, 100]} tick={{ fontSize: 13, fontWeight: 800, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis yAxisId="sensor" orientation="right" domain={[0, 5]} hide />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #bfdbfe", fontSize: "14px", fontWeight: 800 }} />
                <Line
                  yAxisId="health"
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="health"
                  name="Kesehatan"
                  stroke="#2563eb"
                  strokeOpacity={summaryMode !== "trend" || activeTrendMetric === "health" ? 1 : 0.28}
                  strokeWidth={summaryMode === "trend" && activeTrendMetric === "health" ? 5 : 4.2}
                  dot={false}
                />
                <Line
                  yAxisId="sensor"
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="brakeCylinder"
                  name="Brake Cylinder"
                  stroke="#ef4444"
                  strokeOpacity={summaryMode !== "trend" || activeTrendMetric === "brakeCylinder" ? 1 : 0.28}
                  strokeWidth={summaryMode === "trend" && activeTrendMetric === "brakeCylinder" ? 4.8 : 3.5}
                  dot={false}
                />
                <Line
                  yAxisId="sensor"
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="brakePipe"
                  name="Brake Pipe"
                  stroke="#10b981"
                  strokeOpacity={summaryMode !== "trend" || activeTrendMetric === "brakePipe" ? 1 : 0.28}
                  strokeWidth={summaryMode === "trend" && activeTrendMetric === "brakePipe" ? 4.8 : 3.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="car-trend-kpis">
            <span><strong>{car.healthScore}%</strong>Kesehatan saat ini</span>
            <span><strong>{car.brakeCylinderBar.toFixed(1)} bar</strong>Brake Cylinder</span>
            <span><strong>{anomalyMinutes} menit</strong>Durasi anomali</span>
          </div>
          {summaryMode === "trend" ? (
            <div className="car-trend-interpretation">
              <div className="car-trend-analysis-cards compact-row">
                <button
                  type="button"
                  className={`car-trend-analysis-card metric-health${activeTrendMetric === "health" ? " active" : ""}`}
                  onClick={() => setActiveTrendMetric("health")}
                >
                  <span>Kesehatan</span>
                  <strong>{firstTrendPoint?.health ?? car.healthScore}%{" -> "}{car.healthScore}%</strong>
                  <small>{trendDirection === "turun" ? "Memburuk" : trendDirection === "naik" ? "Membaik" : "Stabil"} {Math.abs(healthDelta)} poin.</small>
                </button>
                <button
                  type="button"
                  className={`car-trend-analysis-card metric-cylinder${activeTrendMetric === "brakeCylinder" ? " active" : ""}`}
                  onClick={() => setActiveTrendMetric("brakeCylinder")}
                >
                  <span>Brake Cylinder</span>
                  <strong>{initialBrakeCylinder.toFixed(1)}{" -> "}{car.brakeCylinderBar.toFixed(1)} bar</strong>
                  <small>Anomali utama.</small>
                </button>
                <button
                  type="button"
                  className={`car-trend-analysis-card metric-pipe${activeTrendMetric === "brakePipe" ? " active" : ""}`}
                  onClick={() => setActiveTrendMetric("brakePipe")}
                >
                  <span>Brake Pipe</span>
                  <strong>{averageBrakePipe.toFixed(1)} bar</strong>
                  <small>Stabil.</small>
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        {summaryMode === "trend" ? (
          <Card title="Keterangan Grafik Tren" eyebrow="Analisis grafik" className="car-trend-detail-panel">
            <div className="car-trend-detail-header">
              <strong>Tren kesehatan {carCode}</strong>
              <button type="button" onClick={() => setSummaryMode("action")}>Tutup</button>
            </div>
            <p className="car-trend-short-note">
              Health {trendDirection} {Math.abs(healthDelta)} poin. BC minimum {lowestBrakeCylinder.toFixed(1)} bar. BP stabil {averageBrakePipe.toFixed(1)} bar.
            </p>
            <div className="car-trend-legend">
              <span className="legend-health">Kesehatan {car.healthScore}%</span>
              <span className="legend-cylinder">Brake Cylinder {car.brakeCylinderBar.toFixed(1)} bar</span>
              <span className="legend-pipe">Brake Pipe {car.brakePipeBar.toFixed(1)} bar</span>
            </div>
            <div className="car-trend-detail-grid">
              <span><strong>{anomalyMinutes} menit</strong>Durasi anomali</span>
              <span><strong>{Math.abs(healthDelta)} pt</strong>Perubahan kesehatan</span>
              <span><strong>{lowestBrakeCylinder.toFixed(1)} bar</strong>Titik terendah</span>
              <span><strong>{tone === "danger" ? "Tinggi" : tone === "warning" ? "Waspada" : "Normal"}</strong>Status tren</span>
            </div>
            <div className="car-trend-action-highlight">
              <span>Prioritas</span>
              <strong>{currentNeed}</strong>
            </div>
            <div className="action-row">
              <Button variant="secondary" onClick={onOpenDataSensor}>Lihat Data Sensor</Button>
            </div>
          </Card>
        ) : null}

        {summaryMode === "timeline" ? (
          <Card title="Timeline Kejadian" eyebrow="Urutan operasional" className="car-timeline-summary-panel">
            <p className="car-mode-panel-copy">
              Tampilkan hanya kejadian penting di ringkasan. Timeline lengkap dibuka lewat pop-up agar halaman utama tetap bersih.
            </p>
            <div className="car-event-timeline compact">
              {timelinePreview.slice(0, 4).map((item) => (
                <button className="car-event-item" key={`${item.time}-${item.title}`} onClick={() => openTimelineDialog(item)} type="button">
                  <time>{item.time}</time>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="action-row">
              <Button variant="primary" onClick={() => openTimelineDialog(timelinePreview[0] ?? timeline[0])}>Buka Timeline Lengkap</Button>
              <Button variant="secondary" onClick={onOpenDataSensor}>Data Sensor</Button>
            </div>
          </Card>
        ) : null}

        {summaryMode === "comparison" ? (
          <Card title="Perbandingan Gerbong" eyebrow="Konteks rangkaian" className="car-comparison-summary-panel">
            <p className="car-mode-panel-copy">
              Angka ini menjelaskan apakah kondisi {carCode} merupakan masalah lokal atau bagian dari tren rangkaian.
            </p>
            <div className="car-comparison-grid">
              <span><strong>{car.healthScore}%</strong>{carCode}</span>
              <span><strong>{fleetAverage}%</strong>Rata-rata rangkaian</span>
              <span><strong>{Math.max(1, fleetAverage - car.healthScore)} pt</strong>Deviasi kesehatan</span>
              <span><strong>{car.carNumber}/10</strong>Posisi gerbong</span>
            </div>
            <div className="car-trend-combined-conclusion">
              {carCode} berada di bawah rata-rata rangkaian. Karena Brake Pipe tetap stabil, masalah lebih kuat dibaca sebagai anomali lokal unit.
            </div>
          </Card>
        ) : null}

        {summaryMode === "rule" ? (
          <Card title="Rule Evaluation" eyebrow={car.healthSource ?? "RAMS condition monitoring"} className="car-comparison-summary-panel">
            <div className="car-comparison-grid">
              <span><strong>{car.primaryRuleId ?? "Belum tersedia"}</strong>Primary Rule</span>
              <span><strong>{car.primaryEventCode ?? "Belum tersedia"}</strong>Event Code</span>
              <span><strong>{car.matchedRules?.[0]?.validationStatus ?? "Belum tersedia"}</strong>Validation</span>
              <span><strong>{car.matchedRules?.length ?? 0}/{car.availableRules?.length ?? 0}</strong>Matched/Available</span>
            </div>
            <div className="car-trend-combined-conclusion">
              {car.healthReason ?? "Hasil evaluasi rule belum tersedia dari RAMS."}
            </div>
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 700 }}>Detail aturan</summary>
              <div style={{ maxHeight: 160, overflow: "auto", marginTop: 8 }}>
                {(car.availableRules ?? []).map((rule) => (
                  <div className="car-action-copy" key={rule.ruleId} style={{ marginBottom: 7 }}>
                    <strong>{rule.ruleId} · {rule.level}</strong>
                    <p>{rule.condition} · {rule.validationStatus ?? "Belum tersedia"}</p>
                  </div>
                ))}
                {!car.availableRules?.length ? <p>Rule tersedia belum diberikan backend untuk konteks ini.</p> : null}
              </div>
            </details>
          </Card>
        ) : null}

        {summaryMode === "action" ? (
          <Card title="Apa yang harus dilakukan" eyebrow="Tindakan berikutnya" className={`car-action-panel tone-${tone}`}>
            <div className="car-action-copy">
              <strong>Inspeksi {actionSubsystem} pada {carCode}</strong>
              <p>
                Bandingkan tekanan dengan gerbong terdekat, periksa sambungan/valve, dan validasi pembacaan sensor sebelum perjalanan berikutnya.
              </p>
            </div>
            <div className="car-action-checklist">
              <span>Periksa brake cylinder dan valve</span>
              <span>Bandingkan dengan gerbong referensi</span>
              <span>Catat hasil inspeksi ke SPK</span>
            </div>
            <div className="action-row">
              <Button variant="primary" onClick={() => router.push(workOrderUrl)}>Buat SPK</Button>
              <Button variant="secondary" onClick={onOpenAction}>
                Lihat Tindakan
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {isTimelineOpen && typeof document !== "undefined" ? createPortal((
        <div className="timeline-dialog-backdrop" role="presentation" onClick={() => setIsTimelineOpen(false)}>
          <div
            className="timeline-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="timeline-dialog-header">
              <div>
                <span>{carCode} - {actionSubsystem}</span>
                <h3 id="timeline-dialog-title">Timeline Kejadian Lengkap</h3>
              </div>
              <button type="button" onClick={() => setIsTimelineOpen(false)} aria-label="Tutup timeline">Tutup</button>
            </div>

            <div className="timeline-dialog-filter" aria-label="Filter timeline">
              {timelineFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={timelineFilter === filter.id ? "active" : ""}
                  onClick={() => {
                    setTimelineFilter(filter.id);
                    const nextItems = timeline.filter((item) => {
                      if (filter.id === "all") return true;
                      if (filter.id === "important") return item.important;
                      return item.category === filter.id;
                    });
                    if (nextItems[0]) setSelectedTimelineKey(getTimelineKey(nextItems[0]));
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="timeline-dialog-grid">
              <section className="timeline-important-panel">
                <span>Timeline penting</span>
                <div>
                  {importantTimeline.map((item) => (
                    <button
                      className={getTimelineKey(item) === getTimelineKey(selectedTimeline) ? "active" : ""}
                      key={`${item.time}-${item.title}`}
                      onClick={() => setSelectedTimelineKey(getTimelineKey(item))}
                      type="button"
                    >
                      <time>{item.time}</time>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="timeline-complete-panel">
                <div className="timeline-complete-title">
                  <span>Timeline lengkap</span>
                  <small>{filteredTimeline.length} kejadian tampil</small>
                </div>
                <div className="timeline-complete-list">
                  {filteredTimeline.map((item) => (
                    <button
                      className={`timeline-complete-item category-${item.category}${getTimelineKey(item) === getTimelineKey(selectedTimeline) ? " active" : ""}`}
                      key={`${item.time}-${item.title}`}
                      onClick={() => setSelectedTimelineKey(getTimelineKey(item))}
                      type="button"
                    >
                      <time>{item.time}</time>
                      <div>
                        <span>{item.category}</span>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="timeline-selected-panel">
                <span>Detail kejadian terpilih</span>
                <strong>{selectedTimeline.title}</strong>
                <time>{selectedTimeline.time}</time>
                <p>{selectedTimeline.text}</p>
                <div className="timeline-selected-meta">
                  <span>Kategori: {selectedTimeline.category}</span>
                  <span>{selectedTimeline.important ? "Prioritas penting" : "Konteks pendukung"}</span>
                  <span>{carCode}</span>
                  <span>{actionSubsystem}</span>
                </div>
                <div className="timeline-selected-note">
                  Gunakan detail ini untuk menelusuri bukti sensor atau membuka tindakan yang relevan tanpa meninggalkan halaman Gerbong.
                </div>
              </aside>
            </div>

            <div className="timeline-dialog-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsTimelineOpen(false);
                  onOpenDataSensor?.();
                }}
              >
                Lihat Data Sensor
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsTimelineOpen(false);
                  onOpenAction?.();
                }}
              >
                Lihat Tindakan
              </Button>
            </div>
          </div>
        </div>
      ), document.body) : null}

    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarBlank,
  ChartLineUp,
  ClipboardText,
  FunnelSimple,
  MagnifyingGlass,
  X
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { MaintenanceTable } from "./MaintenanceTable";
import { RiskRanking } from "./RiskRanking";
import { RiskSummary } from "./RiskSummary";
import { RiskTrendChart } from "./RiskTrendChart";
import type { MaintenanceRisk } from "@/types/maintenance";
import {
  buildRiskView,
  filterRiskViews,
  getRiskFilter,
  type PredictiveRiskView,
  type RiskFilter
} from "./riskViewModel";

const horizons = ["7 Hari", "14 Hari", "30 Hari"] as const;
type PredictiveTtwFilter = "all" | "under24" | "oneToThree";
type PredictiveQualityFilter = "all" | "complete" | "limited";
type PredictiveStatusFilter = "all" | PredictiveRiskView["status"];

function getPortalRoot() {
  return typeof document === "undefined" ? null : document.body;
}

function RiskMetric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

export function PredictiveMaintenanceWorkspace({ risks }: { risks: MaintenanceRisk[] }) {
  const router = useRouter();
  const riskViews = useMemo(() => risks.map(buildRiskView), [risks]);
  const [selectedId, setSelectedId] = useState(riskViews[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<RiskFilter>("all");
  const [query, setQuery] = useState("");
  const [trainsetFilter, setTrainsetFilter] = useState("all");
  const [carFilter, setCarFilter] = useState("all");
  const [subsystemFilter, setSubsystemFilter] = useState("all");
  const [ttwFilter, setTtwFilter] = useState<PredictiveTtwFilter>("all");
  const [qualityFilter, setQualityFilter] = useState<PredictiveQualityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<PredictiveStatusFilter>("all");
  const [horizon, setHorizon] = useState<(typeof horizons)[number]>("7 Hari");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSpkOpen, setIsSpkOpen] = useState(false);
  const [isAllQueueOpen, setIsAllQueueOpen] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState("");
  const [spkDraftStatus, setSpkDraftStatus] = useState("");
  const portalRoot = getPortalRoot();

  const trainsetOptions = useMemo(() => Array.from(new Set(riskViews.map((risk) => risk.trainsetId))), [riskViews]);
  const carOptions = useMemo(() => Array.from(new Set(riskViews.map((risk) => String(risk.carNumber)))).sort((a, b) => Number(a) - Number(b)), [riskViews]);
  const subsystemOptions = useMemo(() => Array.from(new Set(riskViews.map((risk) => risk.subsystem))), [riskViews]);

  const filteredRisks = useMemo(() => {
    return filterRiskViews(riskViews, activeFilter, query).filter((risk) => {
      const ttwHours = risk.timeToWarning.includes("hari")
        ? Number.parseInt(risk.timeToWarning, 10) * 24
        : Number.parseInt(risk.timeToWarning, 10);
      const matchesTtw = ttwFilter === "all"
        || (ttwFilter === "under24" ? ttwHours < 24 : ttwHours >= 24 && ttwHours <= 72);
      const matchesQuality = qualityFilter === "all"
        || (qualityFilter === "complete" ? risk.missingTelemetry < 12 : risk.missingTelemetry >= 12);

      return (
        (trainsetFilter === "all" || risk.trainsetId === trainsetFilter) &&
        (carFilter === "all" || String(risk.carNumber) === carFilter) &&
        (subsystemFilter === "all" || risk.subsystem === subsystemFilter) &&
        matchesTtw &&
        matchesQuality &&
        (statusFilter === "all" || risk.status === statusFilter)
      );
    });
  }, [activeFilter, carFilter, qualityFilter, query, riskViews, statusFilter, subsystemFilter, trainsetFilter, ttwFilter]);
  const selectedRisk = filteredRisks.find((risk) => risk.id === selectedId) ?? filteredRisks[0] ?? riskViews.find((risk) => risk.id === selectedId) ?? riskViews[0];
  const activeFilterCount = [
    activeFilter !== "all",
    trainsetFilter !== "all",
    carFilter !== "all",
    subsystemFilter !== "all",
    ttwFilter !== "all",
    qualityFilter !== "all",
    statusFilter !== "all",
    query.trim().length > 0
  ].filter(Boolean).length;

  const workOrderUrl = selectedRisk
    ? `/work-order?trainset=${encodeURIComponent(selectedRisk.trainsetId)}&car=${selectedRisk.carNumber}&subsystem=${encodeURIComponent(selectedRisk.subsystem)}&source=predictive-maintenance`
    : "/work-order";

  const selectRisk = (id: string) => {
    setSelectedId(id);
  };

  const openDetail = (id = selectedRisk?.id) => {
    if (id) setSelectedId(id);
    setIsAllQueueOpen(false);
    setIsDetailOpen(true);
  };

  const openEvidence = (id = selectedRisk?.id) => {
    if (id) setSelectedId(id);
    setIsAllQueueOpen(false);
    setIsEvidenceOpen(true);
  };

  const resetFilters = () => {
    setActiveFilter("all");
    setTrainsetFilter("all");
    setCarFilter("all");
    setSubsystemFilter("all");
    setTtwFilter("all");
    setQualityFilter("all");
    setStatusFilter("all");
    setQuery("");
  };

  return (
    <div className="page-grid predictive-command-layout predictive-dashboard-page">
      <section className="predictive-toolbar" aria-label="Toolbar prediktif">
        <label className="predictive-search">
          <MagnifyingGlass size={18} />
          <input
            aria-label="Cari aset prediktif"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari aset, gerbong, subsistem"
            value={query}
          />
        </label>
        <Button variant="secondary" icon={<FunnelSimple size={16} />} onClick={() => setIsFilterOpen(true)}>
          Filter {activeFilterCount ? activeFilterCount : ""}
        </Button>
        <div className="predictive-horizon" aria-label="Horizon prediksi">
          {horizons.map((item) => (
            <button className={horizon === item ? "active" : ""} key={item} onClick={() => setHorizon(item)} type="button">
              {item}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={resetFilters}>Reset</Button>
        <Button icon={<CalendarBlank size={16} />} onClick={() => setIsScheduleOpen(true)}>
          Jadwalkan Inspeksi
        </Button>
      </section>

      {activeFilter !== "all" || query ? (
        <div className="predictive-active-filters">
          {activeFilter !== "all" ? (
            <button type="button" onClick={() => setActiveFilter("all")}>
              {activeFilter === "high" ? "Risiko Tinggi" : activeFilter === "medium" ? "Risiko Sedang" : activeFilter === "watch" ? "Pantau" : "Data Terbatas"}
              <X size={13} />
            </button>
          ) : null}
          {query ? (
            <button type="button" onClick={() => setQuery("")}>
              Pencarian: {query}
              <X size={13} />
            </button>
          ) : null}
        </div>
      ) : null}

      <section className="risk-command-grid predictive-command-grid">
        <RiskSummary risks={riskViews} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <RiskRanking risks={filteredRisks} selectedId={selectedRisk?.id} onSelectRisk={selectRisk} onOpenAll={() => setIsAllQueueOpen(true)} />
        <RiskTrendChart selectedRisk={selectedRisk} onOpenDetail={() => openDetail()} />
      </section>

      <section className="predictive-queue-layout">
        <MaintenanceTable
          risks={filteredRisks}
          selectedId={selectedRisk?.id}
          onSelectRisk={selectRisk}
          onOpenDetail={openDetail}
          onOpenEvidence={openEvidence}
        />
        {selectedRisk ? (
          <Card
            title="Detail Risiko Terpilih"
            eyebrow={`${selectedRisk.trainsetId} - Gerbong ${selectedRisk.carNumber}`}
            action={
              <div className="predictive-selected-header-actions">
                <Badge label={selectedRisk.severity} severity={selectedRisk.severity} />
                <Button variant="secondary" icon={<ChartLineUp size={16} />} onClick={() => openDetail()}>
                  Buka Analisis Risiko
                </Button>
                <Button icon={<ClipboardText size={16} />} onClick={() => setIsSpkOpen(true)}>
                  Buat Draft SPK
                </Button>
              </div>
            }
            className="predictive-selected-card"
          >
            <div className="predictive-selected-head">
              <strong>{selectedRisk.subsystem} - Risiko {getRiskFilter(selectedRisk) === "high" ? "Tinggi" : "Sedang"}</strong>
              <p>{selectedRisk.impact}</p>
            </div>
            <div className="predictive-detail-panel">
              <RiskMetric label="Skor Risiko" value={`${selectedRisk.riskScore}%`} />
              <RiskMetric label="TTW" value={selectedRisk.timeToWarning} />
              <RiskMetric label="Confidence" value={`${selectedRisk.confidence}%`} />
              <RiskMetric label="Threshold" value={selectedRisk.thresholdTime} />
            </div>
            <div className="predictive-recommendation">
              <span>Rekomendasi</span>
              <p>{selectedRisk.recommendation}</p>
            </div>
          </Card>
        ) : null}
      </section>

      {portalRoot && isFilterOpen ? createPortal(
        <div className="predictive-overlay" role="presentation" onClick={() => setIsFilterOpen(false)}>
          <aside className="predictive-sheet" role="dialog" aria-modal="true" aria-label="Filter prediktif" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div>
                <span>Filter prediktif</span>
                <h3>Atur tampilan risiko</h3>
              </div>
              <button type="button" onClick={() => setIsFilterOpen(false)}><X size={18} /></button>
            </div>
            <div className="predictive-filter-form">
              <label>Trainset<select value={trainsetFilter} onChange={(event) => setTrainsetFilter(event.target.value)}><option value="all">Semua trainset</option>{trainsetOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Gerbong<select value={carFilter} onChange={(event) => setCarFilter(event.target.value)}><option value="all">Semua gerbong</option>{carOptions.map((item) => <option key={item} value={item}>Gerbong {item}</option>)}</select></label>
              <label>Subsistem<select value={subsystemFilter} onChange={(event) => setSubsystemFilter(event.target.value)}><option value="all">Semua subsistem</option>{subsystemOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Tingkat risiko<select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value as RiskFilter)}><option value="all">Semua</option><option value="high">Risiko tinggi</option><option value="medium">Risiko sedang</option><option value="watch">Pantau</option><option value="limited">Data terbatas</option></select></label>
              <label>Rentang TTW<select value={ttwFilter} onChange={(event) => setTtwFilter(event.target.value as PredictiveTtwFilter)}><option value="all">Semua TTW</option><option value="under24">&lt; 24 jam</option><option value="oneToThree">1-3 hari</option></select></label>
              <label>Kualitas data<select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value as PredictiveQualityFilter)}><option value="all">Semua kualitas</option><option value="complete">Lengkap</option><option value="limited">Data terbatas</option></select></label>
              <label>Status SPK<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PredictiveStatusFilter)}><option value="all">Semua status</option><option value="Siap SPK">Siap SPK</option><option value="Perlu validasi">Perlu validasi</option><option value="Pantau">Pantau</option></select></label>
              <label>Rentang tanggal<input type="date" /></label>
            </div>
            <div className="predictive-modal-footer">
              <span>{filteredRisks.length} hasil akan ditampilkan</span>
              <Button variant="ghost" onClick={resetFilters}>Reset Filter</Button>
              <Button onClick={() => setIsFilterOpen(false)}>Terapkan Filter</Button>
            </div>
          </aside>
        </div>,
        portalRoot
      ) : null}

      {portalRoot && isDetailOpen && selectedRisk ? createPortal(
        <div className="predictive-overlay" role="presentation" onClick={() => setIsDetailOpen(false)}>
          <aside className="predictive-drawer" role="dialog" aria-modal="true" aria-label="Analisis risiko" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div>
                <span>{selectedRisk.trainsetId} - Gerbong {selectedRisk.carNumber}</span>
                <h3>Analisis Risiko {selectedRisk.subsystem}</h3>
              </div>
              <button type="button" onClick={() => setIsDetailOpen(false)}><X size={18} /></button>
            </div>
            <div className="predictive-drawer-body">
              <section><span>Ringkasan prediksi</span><p>Risiko {selectedRisk.riskScore}% dengan TTW {selectedRisk.timeToWarning} dan confidence {selectedRisk.confidence}%.</p></section>
              <section><span>Faktor pendorong</span><p>Tren {selectedRisk.trend}, deviasi subsystem {selectedRisk.subsystem}, dan telemetry hilang {selectedRisk.missingTelemetry}%.</p></section>
              <section><span>Evidence pendukung</span><p>Nilai sensor bergerak mendekati threshold dan perlu dibandingkan dengan gerbong referensi sebelum inspeksi.</p></section>
              <section><span>Dampak operasional</span><p>{selectedRisk.impact}</p></section>
              <section><span>Rekomendasi pemeriksaan</span><p>{selectedRisk.recommendation}</p></section>
              <section><span>Riwayat skor</span><p>H-3 52%, H-2 58%, H-1 67%, saat ini {selectedRisk.riskScore}%.</p></section>
            </div>
          </aside>
        </div>,
        portalRoot
      ) : null}

      {portalRoot && isEvidenceOpen && selectedRisk ? createPortal(
        <div className="predictive-overlay centered" role="presentation" onClick={() => setIsEvidenceOpen(false)}>
          <section className="predictive-dialog" role="dialog" aria-modal="true" aria-label="Evidence risiko" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div><span>Evidence prediktif</span><h3>{selectedRisk.trainsetId} Gerbong {selectedRisk.carNumber}</h3></div>
              <button type="button" onClick={() => setIsEvidenceOpen(false)}><X size={18} /></button>
            </div>
            <div className="predictive-evidence-grid">
              <RiskMetric label="Sensor utama" value={selectedRisk.subsystem} />
              <RiskMetric label="Rentang normal" value="2.1-2.4 bar" />
              <RiskMetric label="Deviasi" value={`${Math.max(7, selectedRisk.riskScore - 72)}%`} />
              <RiskMetric label="Kualitas data" value={`${100 - selectedRisk.missingTelemetry}%`} />
            </div>
            <p className="chart-caption">Evidence ini adalah simulasi dari dummy/service untuk membantu operator memutuskan apakah perlu membuka investigasi Gerbong.</p>
            <div className="predictive-modal-footer"><Button onClick={() => setIsEvidenceOpen(false)}>Tutup</Button></div>
          </section>
        </div>,
        portalRoot
      ) : null}

      {portalRoot && isScheduleOpen ? createPortal(
        <div className="predictive-overlay centered" role="presentation" onClick={() => setIsScheduleOpen(false)}>
          <section className="predictive-dialog" role="dialog" aria-modal="true" aria-label="Jadwalkan inspeksi" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div><span>Jadwalkan inspeksi</span><h3>Window maintenance prediktif</h3></div>
              <button type="button" onClick={() => setIsScheduleOpen(false)}><X size={18} /></button>
            </div>
            <div className="predictive-filter-form two-col">
              <label>Aset<input readOnly value={selectedRisk ? `${selectedRisk.trainsetId} Gerbong ${selectedRisk.carNumber}` : "Belum ada aset"} /></label>
              <label>Depo<select><option>Depo Bandung</option><option>Depo Jakarta Kota</option></select></label>
              <label>Tanggal<input type="date" /></label>
              <label>Jam<input type="time" /></label>
              <label>Durasi<select><option>2 jam</option><option>4 jam</option></select></label>
              <label>Teknisi<select><option>Tim Brake & Pneumatic</option><option>Tim Electrical</option></select></label>
            </div>
            <div className="predictive-modal-footer"><Button variant="ghost" onClick={() => setIsScheduleOpen(false)}>Batal</Button><Button onClick={() => setScheduleStatus("Jadwal inspeksi tersimpan di state lokal untuk simulasi.")}>Simpan Jadwal</Button></div>
            {scheduleStatus ? <p className="chart-caption">{scheduleStatus}</p> : null}
          </section>
        </div>,
        portalRoot
      ) : null}

      {portalRoot && isSpkOpen && selectedRisk ? createPortal(
        <div className="predictive-overlay centered" role="presentation" onClick={() => setIsSpkOpen(false)}>
          <section className="predictive-dialog" role="dialog" aria-modal="true" aria-label="Buat draft SPK" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div><span>Draft SPK</span><h3>{selectedRisk.trainsetId} Gerbong {selectedRisk.carNumber}</h3></div>
              <button type="button" onClick={() => setIsSpkOpen(false)}><X size={18} /></button>
            </div>
            <div className="predictive-filter-form">
              <label>Subsistem<input readOnly value={selectedRisk.subsystem} /></label>
              <label>Prioritas<input readOnly value={getRiskFilter(selectedRisk) === "high" ? "Tinggi" : "Sedang"} /></label>
              <label>Rekomendasi<textarea readOnly value={selectedRisk.recommendation} /></label>
              <label>Catatan operator<textarea placeholder="Tambahkan catatan inspeksi" /></label>
            </div>
            <div className="predictive-modal-footer">
              <Button variant="ghost" onClick={() => setSpkDraftStatus("Draft SPK tersimpan di state lokal. Gunakan Buat SPK untuk membuka halaman SPK.")}>Simpan Draft</Button>
              <Button onClick={() => router.push(workOrderUrl)}>Buat SPK</Button>
            </div>
            {spkDraftStatus ? <p className="chart-caption">{spkDraftStatus}</p> : null}
          </section>
        </div>,
        portalRoot
      ) : null}

      {portalRoot && isAllQueueOpen ? createPortal(
        <div className="predictive-overlay centered" role="presentation" onClick={() => setIsAllQueueOpen(false)}>
          <section className="predictive-full-dialog" role="dialog" aria-modal="true" aria-label="Semua antrean prediktif" onClick={(event) => event.stopPropagation()}>
            <div className="predictive-modal-header">
              <div><span>Antrean lengkap</span><h3>Semua Risiko Prediktif</h3></div>
              <button type="button" onClick={() => setIsAllQueueOpen(false)}><X size={18} /></button>
            </div>
            <MaintenanceTable risks={filteredRisks} selectedId={selectedRisk?.id} onSelectRisk={selectRisk} onOpenDetail={openDetail} onOpenEvidence={openEvidence} showAll />
          </section>
        </div>,
        portalRoot
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FunnelSimple, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { Severity, SubsystemName } from "@/types/common";
import type { Insight } from "@/types/insight";
import type { RamsLlmRecommendationDto } from "@/types/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";
import { generateLlmRecommendation } from "@/services/insightService";

type ValidationStatus = "Belum divalidasi" | "Insight Sesuai" | "Perlu Koreksi" | "False Positive";
type AnalysisTab = "confidence" | "impact" | "validation";
type LeftPanelTab = "evidence" | "root";
type ProcessTab = "sensor" | "rule" | "event" | "json" | "natural" | "history";
type CarRangeFilter = "all" | "C1-C3" | "C4-C7" | "C8-C10";

const confidenceBreakdown = [
  { label: "Kualitas sensor", value: 94 },
  { label: "Kesesuaian rule", value: 91 },
  { label: "Konsistensi pola", value: 84 },
  { label: "Riwayat kasus serupa", value: 78 },
];

const supportingEvidence = [
  "Brake Cylinder berada jauh di bawah normal.",
  "Brake Pipe tetap stabil selama anomali muncul.",
  "Anomali hanya terdeteksi pada satu gerbong.",
  "Pola bertahan selama beberapa menit.",
];

const confirmationEvidence = [
  "Belum ada hasil inspeksi fisik dari teknisi.",
  "Kalibrasi sensor terakhir belum dikonfirmasi.",
  "Kondisi control valve belum diperiksa.",
  "Potensi gangguan sensor masih mungkin.",
];

const rootCauses = [
  {
    title: "Kebocoran lokal",
    likelihood: "Kemungkinan tinggi",
    detail: "Tekanan Brake Cylinder turun jauh sementara Brake Pipe tetap stabil. Pola ini paling kuat mengarah ke gangguan lokal pada jalur brake cylinder.",
  },
  {
    title: "Respons control valve terlambat",
    likelihood: "Kemungkinan sedang",
    detail: "Deviasi muncul saat siklus pengereman penuh, sehingga respons control valve perlu diuji saat inspeksi.",
  },
  {
    title: "Sambungan selang kurang rapat",
    likelihood: "Kemungkinan sedang",
    detail: "Tekanan rendah dapat muncul bila sambungan pneumatik lokal tidak menahan tekanan secara konsisten.",
  },
  {
    title: "Kesalahan kalibrasi sensor",
    likelihood: "Kemungkinan rendah",
    detail: "Masih mungkin terjadi, namun pola pembanding Brake Pipe membuat kandidat ini tidak menjadi prioritas utama.",
  },
];

const processTabs: Array<{ id: ProcessTab; label: string }> = [
  { id: "sensor", label: "Input Sensor" },
  { id: "rule", label: "Evaluasi Rule" },
  { id: "event", label: "Event Detection" },
  { id: "json", label: "Structured JSON" },
  { id: "natural", label: "Natural Insight" },
  { id: "history", label: "Riwayat Pemrosesan" },
];

function getEvidenceValue(insight: Insight, key: string, fallback: string) {
  const value = insight.evidence[key];
  return value === undefined ? fallback : String(value);
}

function buildReasonSteps(insight: Insight) {
  const bc = getEvidenceValue(insight, "bc", "1.1");
  const bp = getEvidenceValue(insight, "bp", "4.2");

  return [
    {
      label: "Data",
      value: `BC ${bc} bar`,
      detail: "Input telemetry menunjukkan tekanan Brake Cylinder turun pada siklus pengereman.",
      threshold: "Nilai normal BC 2.1-2.4 bar",
      evidence: `Brake Cylinder ${bc} bar`,
      output: "Sinyal awal anomali tekanan lokal",
    },
    {
      label: "Rule",
      value: "Di bawah 2.1 bar",
      detail: "Rule analitik membandingkan nilai aktual terhadap ambang batas minimum.",
      threshold: "Minimum 2.1 bar",
      evidence: `BC aktual ${bc} bar`,
      output: "Rule pressure_low terpenuhi",
    },
    {
      label: "Pembanding",
      value: "BP stabil",
      detail: "Brake Pipe tidak menunjukkan penurunan besar, sehingga gangguan tidak dibaca sebagai masalah trainset-wide.",
      threshold: "BP stabil sekitar 4.2 bar",
      evidence: `Brake Pipe ${bp} bar`,
      output: "Area masalah dipersempit ke gerbong",
    },
    {
      label: "Kesimpulan",
      value: "Gangguan lokal",
      detail: `Kombinasi BC rendah dan BP stabil mengarah pada gangguan lokal Gerbong ${insight.carNumber}.`,
      threshold: "Korelasi BC rendah + BP stabil",
      evidence: `${insight.trainsetId} - C${insight.carNumber}`,
      output: "Perlu validasi operasional",
    },
    {
      label: "Diagnosis",
      value: insight.event,
      detail: `Diagnosis final ${insight.event} dengan confidence ${insight.confidence}%.`,
      threshold: "Confidence minimal untuk eskalasi 70%",
      evidence: `${insight.confidence}%`,
      output: insight.diagnosis,
    },
  ];
}

function getValidationMap(insights: Insight[], defaultValue: ValidationStatus) {
  return Object.fromEntries(insights.map((insight) => [insight.id, defaultValue])) as Record<string, ValidationStatus>;
}

function matchesCarRange(carNumber: number, range: CarRangeFilter) {
  if (range === "all") return true;
  if (range === "C1-C3") return carNumber >= 1 && carNumber <= 3;
  if (range === "C4-C7") return carNumber >= 4 && carNumber <= 7;
  return carNumber >= 8 && carNumber <= 10;
}

function parseEmbeddedLlm(value: unknown): Partial<RamsLlmRecommendationDto> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" ? parsed as Partial<RamsLlmRecommendationDto> : { summary: value };
    } catch {
      return { summary: value };
    }
  }
  return typeof value === "object" ? value as Partial<RamsLlmRecommendationDto> : null;
}

export function InsightWorkspace({ insights, isDummy = false, onRefresh }: { insights: Insight[]; isDummy?: boolean; onRefresh?: () => Promise<void> }) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextualInsight = insights.find((insight) =>
    (!searchParams.get("trainset") || insight.trainsetId === searchParams.get("trainset")) &&
    (!searchParams.get("car") || String(insight.carNumber) === searchParams.get("car")?.replace(/^C/i, "")) &&
    (!searchParams.get("subsystem") || insight.subsystem === searchParams.get("subsystem"))
  );
  const [selectedId, setSelectedId] = useState(searchParams.get("insight") ?? contextualInsight?.id ?? insights[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [subsystem, setSubsystem] = useState<"all" | SubsystemName>((searchParams.get("subsystem") as SubsystemName | null) ?? "all");
  const [trainset, setTrainset] = useState(searchParams.get("trainset") ?? "all");
  const [validationFilter, setValidationFilter] = useState<"all" | ValidationStatus>("all");
  const [carRange, setCarRange] = useState<CarRangeFilter>("all");
  const [confidenceMin, setConfidenceMin] = useState(0);
  const [timeRange, setTimeRange] = useState("Hari ini");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isSpkOpen, setIsSpkOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [processTab, setProcessTab] = useState<ProcessTab>("sensor");
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("evidence");
  const [evidenceTab, setEvidenceTab] = useState<"supporting" | "confirming">("supporting");
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("confidence");
  const [activeStepIndex, setActiveStepIndex] = useState(4);
  const [openRootIndex, setOpenRootIndex] = useState(0);
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const [showAllRootCauses, setShowAllRootCauses] = useState(false);
  const [showMoreConfidence, setShowMoreConfidence] = useState(false);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [isNaturalExpanded, setIsNaturalExpanded] = useState(false);
  const [isLlmOpen, setIsLlmOpen] = useState(false);
  const [llmResult, setLlmResult] = useState<RamsLlmRecommendationDto | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");
  const [refreshStatus, setRefreshStatus] = useState("");
  const [validations, setValidations] = useState(() => getValidationMap(insights, "Belum divalidasi"));
  const [validationNote, setValidationNote] = useState("Perlu inspeksi fisik pada brake cylinder sebelum perjalanan berikutnya.");

  const activeInsight = insights.find((insight) => insight.id === selectedId) ?? insights[0];
  const embeddedLlm = parseEmbeddedLlm(activeInsight.llmRecommendation);
  const llmRecommendation = llmResult ?? embeddedLlm;
  const canGenerateLlm = !isDummy && hasPermission(user?.role, "refresh_analytics");
  const reasonSteps = useMemo(() => buildReasonSteps(activeInsight), [activeInsight]);
  const workOrderUrl = `/work-order?trainset=${encodeURIComponent(activeInsight.trainsetId)}&car=${activeInsight.carNumber}&subsystem=${encodeURIComponent(activeInsight.subsystem)}&source=insight-analytic`;

  const filteredInsights = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return insights.filter((insight) => {
      const validation = validations[insight.id] ?? "Belum divalidasi";
      const matchesQuery =
        normalizedQuery.length === 0 ||
        insight.event.toLowerCase().includes(normalizedQuery) ||
        insight.diagnosis.toLowerCase().includes(normalizedQuery) ||
        insight.trainsetId.toLowerCase().includes(normalizedQuery) ||
        String(insight.carNumber).includes(normalizedQuery);

      return (
        matchesQuery &&
        (severity === "all" || insight.severity === severity) &&
        (subsystem === "all" || insight.subsystem === subsystem) &&
        (trainset === "all" || insight.trainsetId === trainset) &&
        matchesCarRange(insight.carNumber, carRange) &&
        (validationFilter === "all" || validation === validationFilter) &&
        insight.confidence >= confidenceMin
      );
    });
  }, [carRange, confidenceMin, insights, query, severity, subsystem, trainset, validationFilter, validations]);

  const activeFilterCount = [
    severity !== "all",
    subsystem !== "all",
    trainset !== "all",
    carRange !== "all",
    validationFilter !== "all",
    confidenceMin > 0,
    timeRange !== "Hari ini",
    query.trim().length > 0,
  ].filter(Boolean).length;

  const validation = validations[activeInsight.id] ?? "Belum divalidasi";
  const bcValue = getEvidenceValue(activeInsight, "bc", "-");
  const bpValue = getEvidenceValue(activeInsight, "bp", "-");
  const activeStep = reasonSteps[activeStepIndex] ?? reasonSteps[0];
  const liveEvidenceItems = Object.entries(activeInsight.evidence).map(([key, value]) => `${key}: ${String(value)}`);
  const activeEvidenceItems = evidenceTab === "supporting"
    ? (isDummy ? supportingEvidence : liveEvidenceItems)
    : (isDummy ? confirmationEvidence : ["Konfirmasi lapangan belum tersedia dari endpoint RAMS."]);
  const visibleEvidenceItems = showAllEvidence ? activeEvidenceItems : activeEvidenceItems.slice(0, 3);
  const activeRootCauses = activeInsight.probableCauses?.length
    ? activeInsight.probableCauses.map((cause) => ({ title: cause, likelihood: "Dari RAMS", detail: activeInsight.technicalExplanation || activeInsight.diagnosis }))
    : (isDummy ? rootCauses : []);
  const visibleRootCauses = showAllRootCauses ? activeRootCauses : activeRootCauses.slice(0, 3);

  async function handleGenerateLlm() {
    if (!canGenerateLlm) return;
    setLlmLoading(true);
    setLlmError("");
    try {
      const result = await generateLlmRecommendation({
        trainset_id: activeInsight.trainsetId,
        car_id: activeInsight.carId,
        subsystem: activeInsight.subsystem,
        diagnosis: activeInsight.diagnosis,
        evidence: activeInsight.evidence,
        recommended_actions: activeInsight.recommendedActions
      });
      setLlmResult(result.data.recommendation);
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : "Rekomendasi LLM gagal dibuat.");
    } finally {
      setLlmLoading(false);
    }
  }

  function resetFilters() {
    setQuery("");
    setSeverity("all");
    setSubsystem("all");
    setTrainset("all");
    setCarRange("all");
    setValidationFilter("all");
    setConfidenceMin(0);
    setTimeRange("Hari ini");
  }

  function selectInsight(row: Insight) {
    setSelectedId(row.id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("insight", row.id);
    params.set("trainset", row.trainsetId);
    params.set("car", String(row.carNumber));
    params.set("subsystem", row.subsystem);
    router.replace(`?${params.toString()}`, { scroll: false });
    setActiveStepIndex(4);
    setIsNaturalExpanded(false);
  }

  function setValidation(status: ValidationStatus) {
    setValidations((current) => ({ ...current, [activeInsight.id]: status }));
    setIsNoteOpen(true);
  }

  return (
    <div className="page-grid insight-layout insight-workspace">
      <div className="insight-toolbar">
        <div className="insight-search-wrap">
          <MagnifyingGlass size={16} />
          <input
            aria-label="Cari insight atau aset"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari aset, diagnosis, trainset"
          />
        </div>
        <Button icon={<FunnelSimple size={16} />} onClick={() => setIsFilterOpen(true)} variant="secondary">
          Filter
        </Button>
        <span className="insight-filter-count">{activeFilterCount} aktif</span>
        <Button onClick={resetFilters} variant="ghost">Reset</Button>
        <Button onClick={() => setIsProcessOpen(true)} variant="secondary">Detail Proses Analitik</Button>
        <Button onClick={() => setIsLlmOpen(true)} variant="secondary">Rekomendasi LLM</Button>
        {onRefresh ? <Button onClick={async () => { setRefreshStatus("Memproses..."); try { await onRefresh(); setRefreshStatus("Insight diperbarui."); } catch (error) { setRefreshStatus(error instanceof Error ? error.message : "Refresh gagal."); } }} variant="secondary">Refresh RAMS</Button> : null}
        <Button onClick={() => setIsSpkOpen(true)}>Buat Draft SPK</Button>
      </div>
      {refreshStatus ? <p className="chart-caption">{refreshStatus}</p> : null}

      <section className="insight-summary-panel">
        <div className="insight-summary-main">
          <div className="insight-summary-title-row">
            <div>
              <p className="eyebrow">Diagnosis utama</p>
              <h2>{activeInsight.event}</h2>
            </div>
            <Badge label={activeInsight.severity} severity={activeInsight.severity} />
          </div>
          <h3>{activeInsight.diagnosis}</h3>
          <p className={isNaturalExpanded ? "insight-summary-copy expanded" : "insight-summary-copy"}>{activeInsight.naturalInsight}</p>
          <div className="insight-summary-recommendation">
            <span>Rekomendasi</span>
            <strong>{activeInsight.recommendation}</strong>
          </div>
          <div className="insight-summary-actions">
            <Button onClick={() => setIsNaturalExpanded((value) => !value)} variant="secondary">
              {isNaturalExpanded ? "Ringkas Narasi" : "Baca Lengkap"}
            </Button>
            <Button
              onClick={() => {
                setLeftPanelTab("evidence");
                setShowAllEvidence(true);
              }}
              variant="secondary"
            >
              Tinjau Bukti
            </Button>
            <Button onClick={() => setIsSpkOpen(true)}>Buat Draft SPK</Button>
          </div>
        </div>
        <aside className="insight-summary-metrics">
          <MetricTile label="Health" value={`${activeInsight.healthScore}%`} tone="health" />
          <MetricTile label="Confidence" value={`${activeInsight.confidence}%`} tone="confidence" />
          <MetricTile label="Brake Cylinder" value={`${bcValue} bar`} tone="danger" />
          <MetricTile label="Brake Pipe" value={`${bpValue} bar`} tone="normal" />
          <div className="insight-summary-context">
            <span>{activeInsight.trainsetId} - C{activeInsight.carNumber}</span>
            <strong>{activeInsight.subsystem}</strong>
            <small>Status validasi: {validation}</small>
            <small>Dibuat oleh: {activeInsight.generatedBy ?? "Tidak tersedia"}</small>
            <small>Source event: {activeInsight.sourceEventId ?? "Tidak tersedia"}</small>
            <small>Waktu: {activeInsight.createdAt ? new Date(activeInsight.createdAt).toLocaleString("id-ID") : "Tidak tersedia"}</small>
          </div>
        </aside>
      </section>

      <section className="insight-reasoning-card card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Rantai alasan diagnosis</p>
            <h2>Data terdeteksi sampai diagnosis</h2>
          </div>
        </div>
        <div className="insight-stepper">
          {reasonSteps.map((step, index) => (
            <button
              className={activeStepIndex === index ? "insight-stepper-item active" : "insight-stepper-item"}
              key={step.label}
              onClick={() => setActiveStepIndex(index)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
              <small>{step.value}</small>
            </button>
          ))}
        </div>
        <div className="insight-step-inline-detail">
          <div>
            <span>Detail tahap</span>
            <strong>{activeStep.label}</strong>
          </div>
          <InfoTile label="Input" value={activeStep.detail} />
          <InfoTile label="Threshold" value={activeStep.threshold} />
          <InfoTile label="Evidence" value={activeStep.evidence} />
          <InfoTile label="Output" value={activeStep.output} />
          <InfoTile label="Waktu proses" value="10:15:06 WIB" />
        </div>
      </section>

      <section className="insight-main-grid">
        <div className="card insight-left-panel">
          <div className="insight-panel-tabs">
            <button className={leftPanelTab === "evidence" ? "active" : ""} onClick={() => setLeftPanelTab("evidence")} type="button">Bukti</button>
            <button className={leftPanelTab === "root" ? "active" : ""} onClick={() => setLeftPanelTab("root")} type="button">Akar Masalah</button>
          </div>

          {leftPanelTab === "evidence" ? (
            <div className="insight-panel-scroll">
              <div className="insight-filter-row">
                <button className={evidenceTab === "supporting" ? "active" : ""} onClick={() => setEvidenceTab("supporting")} type="button">
                  Mendukung
                </button>
                <button className={evidenceTab === "confirming" ? "active" : ""} onClick={() => setEvidenceTab("confirming")} type="button">
                  Perlu Dikonfirmasi
                </button>
              </div>
              <BulletList items={visibleEvidenceItems} />
              <Button onClick={() => setShowAllEvidence((value) => !value)} variant="secondary" style={{ alignSelf: "flex-start", marginTop: "12px" }}>
                {showAllEvidence ? "Tampilkan Ringkas" : "Lihat Semua Bukti"}
              </Button>
            </div>
          ) : null}

          {leftPanelTab === "root" ? (
            <div className="insight-panel-scroll">
              <div className="insight-accordion">
                {visibleRootCauses.map((cause, index) => (
                  <button className={openRootIndex === index ? "open" : ""} key={cause.title} onClick={() => setOpenRootIndex(index)} type="button">
                    <span>
                      <strong>{cause.title}</strong>
                      <small>{cause.likelihood}</small>
                    </span>
                    {openRootIndex === index ? <p>{cause.detail}</p> : null}
                  </button>
                ))}
              </div>
              <Button onClick={() => setShowAllRootCauses((value) => !value)} variant="secondary" style={{ alignSelf: "flex-start", marginTop: "12px" }}>
                {showAllRootCauses ? "Tampilkan 3 Penyebab" : "Lihat Semua Penyebab"}
              </Button>
              {visibleRootCauses.length === 0 ? <p className="empty-state">Probable cause belum tersedia dari RAMS.</p> : null}
            </div>
          ) : null}
        </div>

        <aside className="card insight-tab-panel">
          <div className="insight-panel-tabs">
            <button className={analysisTab === "confidence" ? "active" : ""} onClick={() => setAnalysisTab("confidence")} type="button">Keyakinan</button>
            <button className={analysisTab === "impact" ? "active" : ""} onClick={() => setAnalysisTab("impact")} type="button">Dampak</button>
            <button className={analysisTab === "validation" ? "active" : ""} onClick={() => setAnalysisTab("validation")} type="button">Validasi</button>
          </div>
          {analysisTab === "confidence" ? (
            <div className="insight-tab-content">
              <MetricTile label="Confidence akhir" value={`${activeInsight.confidence}%`} tone="confidence" />
              <ConfidenceRow label="Kualitas sensor" value={94} />
              <ConfidenceRow label="Kesesuaian rule" value={91} />
              {showMoreConfidence ? (
                <>
                  <ConfidenceRow label="Konsistensi pola" value={84} />
                  <ConfidenceRow label="Riwayat kasus serupa" value={78} />
                </>
              ) : null}
              <Button onClick={() => setShowMoreConfidence((value) => !value)} variant="secondary">
                {showMoreConfidence ? "Ringkas Confidence" : "Lihat Detail Confidence"}
              </Button>
            </div>
          ) : null}
          {analysisTab === "impact" ? (
            <div className="insight-impact-grid">
              <InfoTile label="Aset terdampak" value={`${activeInsight.trainsetId} - C${activeInsight.carNumber}`} />
              <InfoTile label="Subsystem" value={activeInsight.subsystem} />
              <InfoTile label="Dampak trainset" value="Lokal" />
              <InfoTile label="Risiko operasional" value={activeInsight.severity === "High" ? "Tinggi" : "Sedang"} />
              <InfoTile label="Urgensi" value="Sebelum perjalanan berikutnya" />
            </div>
          ) : null}
          {analysisTab === "validation" ? (
            <div className="insight-validation-panel">
              <div className="insight-validation-actions">
                {(["Insight Sesuai", "Perlu Koreksi", "False Positive"] as ValidationStatus[]).map((status) => (
                  <Button key={status} onClick={() => setValidation(status)} variant={validation === status ? "primary" : "secondary"}>
                    {status}
                  </Button>
                ))}
              </div>
              <InfoTile label="Status validasi" value={validation} />
              <InfoTile label="Validator" value={validation === "Belum divalidasi" ? "Belum ada" : "Operator Depo 1"} />
              <InfoTile label="Waktu validasi" value={validation === "Belum divalidasi" ? "-" : "11 Juli 2026, 10:22"} />
              <Button onClick={() => setIsNoteOpen(true)} variant="secondary">Tambahkan Catatan</Button>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="insight-active-dock">
        <button className="insight-active-trigger" onClick={() => setShowAllInsights((value) => !value)} type="button">
          <div>
            <span>Insight aktif</span>
            <strong>{activeInsight.trainsetId} - C{activeInsight.carNumber}</strong>
          </div>
          <span className="insight-active-diagnosis">{activeInsight.event}</span>
          <span className="insight-active-meta">{filteredInsights.length} insight tersedia</span>
          <span className="insight-active-action">{showAllInsights ? "Tutup" : "Lihat Semua"}</span>
        </button>

        {showAllInsights ? (
          <div className="insight-active-menu">
            <div className="insight-active-menu-head">
              <strong>Semua Insight Aktif</strong>
              <span>{filteredInsights.length} hasil sesuai filter</span>
            </div>
            <div className="insight-history-compact expanded">
              {filteredInsights.map((row) => (
                <button
                  className={row.id === activeInsight.id ? "insight-history-row active" : "insight-history-row"}
                  key={row.id}
                  onClick={() => {
                    selectInsight(row);
                    setShowAllInsights(false);
                  }}
                  type="button"
                >
                  <span>
                    <strong>{row.trainsetId} - C{row.carNumber}</strong>
                    <small>{row.event}</small>
                  </span>
                  <span>{row.severity}</span>
                  <span>{row.confidence}%</span>
                  <span>{row.healthScore}%</span>
                  <span>{validations[row.id] ?? "Belum divalidasi"}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <FilterSheet
        confidenceMin={confidenceMin}
        isOpen={isFilterOpen}
        severity={severity}
        subsystem={subsystem}
        timeRange={timeRange}
        trainset={trainset}
        validationFilter={validationFilter}
        carRange={carRange}
        insights={insights}
        onClose={() => setIsFilterOpen(false)}
        onConfidenceChange={setConfidenceMin}
        onReset={resetFilters}
        onSeverityChange={setSeverity}
        onSubsystemChange={setSubsystem}
        onTimeRangeChange={setTimeRange}
        onTrainsetChange={setTrainset}
        onCarRangeChange={setCarRange}
        onValidationChange={setValidationFilter}
      />

      <ProcessDialog
        insight={activeInsight}
        isOpen={isProcessOpen}
        onClose={() => setIsProcessOpen(false)}
        onDraftSpk={() => setIsSpkOpen(true)}
        processTab={processTab}
        setProcessTab={setProcessTab}
      />

      <Modal open={isNoteOpen} title="Catatan Validasi" onClose={() => setIsNoteOpen(false)}>
        <div className="insight-modal-body">
          <span>{activeInsight.trainsetId} - C{activeInsight.carNumber}</span>
          <Textarea value={validationNote} onChange={(event) => setValidationNote(event.target.value)} />
          <Button onClick={() => setIsNoteOpen(false)}>Simpan Catatan</Button>
        </div>
      </Modal>

      <Modal open={isSpkOpen} title="Buat Draft SPK" onClose={() => setIsSpkOpen(false)}>
        <div className="insight-modal-body">
          <InfoBlock label="Aset" value={`${activeInsight.trainsetId} - Gerbong ${activeInsight.carNumber}`} />
          <InfoBlock label="Diagnosis" value={activeInsight.event} />
          <InfoBlock label="Rekomendasi" value={activeInsight.recommendation} />
          <Button asChild>
            <Link href={workOrderUrl}>Lanjut ke SPK</Link>
          </Button>
        </div>
      </Modal>

      <Modal open={isLlmOpen} title="Viewer Rekomendasi LLM" onClose={() => setIsLlmOpen(false)}>
        <div className="insight-modal-body">
          <InfoBlock label="Status" value={llmRecommendation?.llm_status ?? (isDummy ? "Dummy" : "Belum tersedia")} />
          <InfoBlock label="Prioritas" value={llmRecommendation?.priority ?? "Tidak tersedia"} />
          <InfoBlock label="Ringkasan" value={llmRecommendation?.summary ?? "RAMS belum mengirim rekomendasi LLM untuk insight ini."} />
          <InfoBlock label="Penjelasan teknis" value={llmRecommendation?.technical_explanation ?? activeInsight.technicalExplanation ?? "Tidak tersedia"} />
          <InfoBlock label="Probable causes" value={llmRecommendation?.probable_causes?.join("; ") ?? activeInsight.probableCauses?.join("; ") ?? "Tidak tersedia"} />
          <InfoBlock label="Recommended actions" value={llmRecommendation?.recommended_actions?.join("; ") ?? activeInsight.recommendedActions?.join("; ") ?? "Tidak tersedia"} />
          <InfoBlock label="Inspection steps" value={llmRecommendation?.inspection_steps?.join("; ") ?? "Tidak tersedia"} />
          <InfoBlock label="Safety notes" value={llmRecommendation?.safety_notes?.join("; ") ?? "Tidak tersedia"} />
          <InfoBlock label="Affected cars" value={llmRecommendation?.affected_cars?.map((car) => `${car.car_id}: ${car.reason}`).join("; ") ?? "Tidak tersedia"} />
          <InfoBlock label="Provider / model" value={[llmRecommendation?.provider, llmRecommendation?.model].filter(Boolean).join(" / ") || "Tidak tersedia"} />
          {llmError ? <p role="alert" className="empty-state">{llmError}</p> : null}
          {canGenerateLlm ? <Button disabled={llmLoading} onClick={handleGenerateLlm}>{llmLoading ? "Memproses..." : "Generate dari RAMS"}</Button> : null}
          {!canGenerateLlm && !isDummy ? <p className="chart-caption">Hanya Admin yang dapat meminta generasi baru. Semua role tetap dapat melihat hasil.</p> : null}
          {user?.role === "ADMIN" && llmRecommendation ? <details><summary>Raw response</summary><pre>{JSON.stringify(llmRecommendation, null, 2)}</pre></details> : null}
        </div>
      </Modal>
    </div>
  );
}

function FilterSheet({
  carRange,
  confidenceMin,
  insights,
  isOpen,
  onClose,
  onConfidenceChange,
  onCarRangeChange,
  onReset,
  onSeverityChange,
  onSubsystemChange,
  onTimeRangeChange,
  onTrainsetChange,
  onValidationChange,
  severity,
  subsystem,
  timeRange,
  trainset,
  validationFilter,
}: {
  carRange: CarRangeFilter;
  confidenceMin: number;
  insights: Insight[];
  isOpen: boolean;
  onClose: () => void;
  onConfidenceChange: (value: number) => void;
  onCarRangeChange: (value: CarRangeFilter) => void;
  onReset: () => void;
  onSeverityChange: (value: "all" | Severity) => void;
  onSubsystemChange: (value: "all" | SubsystemName) => void;
  onTimeRangeChange: (value: string) => void;
  onTrainsetChange: (value: string) => void;
  onValidationChange: (value: "all" | ValidationStatus) => void;
  severity: "all" | Severity;
  subsystem: "all" | SubsystemName;
  timeRange: string;
  trainset: string;
  validationFilter: "all" | ValidationStatus;
}) {
  const trainsets = Array.from(new Set(insights.map((insight) => insight.trainsetId)));
  const subsystems = Array.from(new Set(insights.map((insight) => insight.subsystem)));

  if (!isOpen) return null;

  return (
    <div className="insight-sheet-backdrop" onClick={onClose}>
      <aside className="insight-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="insight-sheet-header">
          <div>
            <span>Filter insight</span>
            <strong>Parameter tampilan</strong>
          </div>
          <button aria-label="Tutup filter" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <FilterSelect label="Trainset" value={trainset} onChange={onTrainsetChange} options={["all", ...trainsets]} />
        <FilterSelect label="Gerbong" value={carRange} onChange={(value) => onCarRangeChange(value as CarRangeFilter)} options={["all", "C1-C3", "C4-C7", "C8-C10"]} />
        <FilterSelect label="Subsystem" value={subsystem} onChange={(value) => onSubsystemChange(value as "all" | SubsystemName)} options={["all", ...subsystems]} />
        <FilterSelect label="Severity" value={severity} onChange={(value) => onSeverityChange(value as "all" | Severity)} options={["all", "Critical", "High", "Medium", "Low", "Normal"]} />
        <FilterSelect label="Status validasi" value={validationFilter} onChange={(value) => onValidationChange(value as "all" | ValidationStatus)} options={["all", "Belum divalidasi", "Insight Sesuai", "Perlu Koreksi", "False Positive"]} />
        <label className="insight-filter-field">
          <span>Confidence minimal</span>
          <input min={0} max={100} type="range" value={confidenceMin} onChange={(event) => onConfidenceChange(Number(event.target.value))} />
          <strong>{confidenceMin}%</strong>
        </label>
        <FilterSelect label="Rentang waktu" value={timeRange} onChange={onTimeRangeChange} options={["Hari ini", "7 hari", "30 hari"]} />
        <div className="insight-sheet-actions">
          <Button onClick={onReset} variant="secondary">Reset</Button>
          <Button onClick={onClose}>Terapkan</Button>
        </div>
      </aside>
    </div>
  );
}

function FilterSelect({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className="insight-filter-field">
      <span>{label}</span>
      <select className="input-control" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option === "all" ? "Semua" : option}</option>
        ))}
      </select>
    </label>
  );
}

function ProcessDialog({
  insight,
  isOpen,
  onClose,
  onDraftSpk,
  processTab,
  setProcessTab,
}: {
  insight: Insight;
  isOpen: boolean;
  onClose: () => void;
  onDraftSpk: () => void;
  processTab: ProcessTab;
  setProcessTab: (tab: ProcessTab) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="insight-process-dialog-backdrop">
      <div className="insight-process-dialog">
        <div className="insight-process-dialog-head">
          <div>
            <span>{insight.trainsetId} - C{insight.carNumber}</span>
            <strong>Detail Proses Analitik</strong>
            <small>{insight.severity} - Confidence {insight.confidence}%</small>
          </div>
          <button aria-label="Tutup detail proses" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <div className="insight-process-tabs">
          {processTabs.map((tab) => (
            <button className={processTab === tab.id ? "active" : ""} key={tab.id} onClick={() => setProcessTab(tab.id)} type="button">
              {tab.label}
            </button>
          ))}
        </div>
        <div className="insight-process-body">
          <ProcessTabContent insight={insight} tab={processTab} />
        </div>
        <div className="insight-process-actions">
          <Button onClick={onDraftSpk}>Buat Draft SPK</Button>
          <Button onClick={onClose} variant="secondary">Tutup</Button>
        </div>
      </div>
    </div>
  );
}

function ProcessTabContent({ insight, tab }: { insight: Insight; tab: ProcessTab }) {
  if (tab === "sensor") {
    return <EvidenceGrid evidence={insight.evidence} />;
  }
  if (tab === "rule") {
    return (
      <div className="insight-drawer-detail">
        <InfoBlock label="Rule utama" value="Brake Cylinder harus berada dalam rentang normal saat Brake Pipe stabil." />
        <InfoBlock label="Threshold" value="BC minimum 2.1 bar, deviasi aktual dibanding median." />
        <InfoBlock label="Hasil" value="Rule pressure_low dan local_deviation terpenuhi." />
      </div>
    );
  }
  if (tab === "event") {
    return (
      <div className="insight-drawer-detail">
        <InfoBlock label="Event" value={insight.event} />
        <InfoBlock label="Komponen terdampak" value={String(insight.structuredInsight.affectedComponent ?? insight.subsystem)} />
        <InfoBlock label="Confidence" value={`${insight.confidence}%`} />
      </div>
    );
  }
  if (tab === "json") {
    return <pre>{JSON.stringify(insight.structuredInsight, null, 2)}</pre>;
  }
  if (tab === "natural") {
    return <p className="insight-process-text">{insight.naturalInsight}</p>;
  }
  return (
    <div className="insight-drawer-detail">
      <InfoBlock label="10:15:02" value="Input sensor diterima." />
      <InfoBlock label="10:15:04" value="Rule base melakukan validasi threshold." />
      <InfoBlock label="10:15:06" value="Event LOCAL_BC_DEVIATION dibuat." />
      <InfoBlock label="10:15:08" value="Natural insight disiapkan untuk operator." />
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="insight-bullet-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function MetricTile({ label, tone, value }: { label: string; tone?: string; value: string }) {
  return (
    <div className={`insight-metric-tile ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="insight-info-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConfidenceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="insight-confidence-row">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="insight-confidence-track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function EvidenceGrid({ evidence }: { evidence: Insight["evidence"] }) {
  return (
    <div className="insight-process-evidence-grid">
      {Object.entries(evidence).map(([key, value]) => (
        <InfoBlock key={key} label={key} value={String(value)} />
      ))}
    </div>
  );
}

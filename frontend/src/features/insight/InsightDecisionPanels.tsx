"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import type { Insight } from "@/types/insight";

const confidenceBreakdown = [
  { label: "Kualitas data sensor", value: 94 },
  { label: "Kesesuaian dengan rule", value: 91 },
  { label: "Konsistensi pola", value: 84 },
  { label: "Riwayat kasus serupa", value: 78 },
  { label: "Confidence akhir", value: 86, final: true },
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

const similarInsights = [
  {
    asset: "Gerbong 7",
    diagnosis: "LOCAL_BC_DEVIATION",
    confidence: "82%",
    action: "Inspeksi seal brake cylinder",
    result: "Selesai diperiksa",
    duration: "2 jam 15 menit",
  },
  {
    asset: "Gerbong 2",
    diagnosis: "Valve response delay",
    confidence: "79%",
    action: "SPK valve response test",
    result: "SPK selesai",
    duration: "3 jam 05 menit",
  },
  {
    asset: "Gerbong 6",
    diagnosis: "Sensor calibration issue",
    confidence: "68%",
    action: "Kalibrasi ulang sensor",
    result: "False positive",
    duration: "1 jam 20 menit",
  },
];

export function DiagnosisReasoningChain({ insight }: { insight: Insight }) {
  const brakeCylinder = insight.evidence.bc ?? "1.1";
  const brakePipe = insight.evidence.bp ?? "4.2";
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      label: "Data terdeteksi",
      value: `Brake Cylinder turun ke ${brakeCylinder} bar.`,
      detail: `Input telemetry menunjukkan Brake Cylinder Gerbong ${insight.carNumber} turun ke ${brakeCylinder} bar saat siklus pengereman. Nilai ini menjadi sinyal awal bahwa masalah terjadi pada tekanan lokal gerbong.`,
      status: "warning",
    },
    {
      label: "Validasi rule",
      value: "Nilai berada di bawah batas normal 2.1-2.4 bar.",
      detail: "Rule analitik membandingkan nilai aktual dengan rentang normal. Karena pembacaan berada di bawah threshold, event masuk kategori perlu validasi operasional.",
      status: "warning",
    },
    {
      label: "Pola pembanding",
      value: `Brake Pipe tetap stabil di ${brakePipe} bar.`,
      detail: `Brake Pipe tetap berada di sekitar ${brakePipe} bar, sehingga tekanan utama rangkaian tidak menunjukkan gangguan besar. Pola ini mempersempit area masalah ke komponen lokal.`,
      status: "normal",
    },
    {
      label: "Kesimpulan sistem",
      value: `Gangguan kemungkinan bersifat lokal pada Gerbong ${insight.carNumber}.`,
      detail: `Kombinasi Brake Cylinder rendah dan Brake Pipe stabil mengarah pada masalah lokal seperti kebocoran ringan, respons valve terlambat, atau kalibrasi sensor pada Gerbong ${insight.carNumber}.`,
      status: "normal",
    },
    {
      label: "Diagnosis",
      value: insight.event,
      code: true,
      detail: `Output diagnosis final adalah ${insight.event} dengan confidence ${insight.confidence}%. Hasil ini perlu dikonfirmasi melalui inspeksi fisik sebelum tindakan ditutup.`,
      status: "final",
    },
  ];
  const selectedStep = activeStep === null ? null : steps[activeStep];

  return (
    <Card title="Rantai Alasan Diagnosis" eyebrow="Logika analitik sistem" className="insight-reasoning-card">
      <div className="insight-compact-points" role="list">
        {steps.map((step, index) => (
          <button
            className="insight-compact-point"
            key={step.label}
            onClick={() => setActiveStep(index)}
            type="button"
          >
            <span className="insight-compact-index">{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              {step.code ? <code>{step.value}</code> : <p>{step.value}</p>}
            </div>
            <small className={`insight-step-status ${step.status}`}>{step.status}</small>
          </button>
        ))}
      </div>

      <Modal
        open={selectedStep !== null}
        title={selectedStep ? `Detail ${selectedStep.label}` : "Detail diagnosis"}
        onClose={() => setActiveStep(null)}
      >
        {selectedStep ? (
          <div className="insight-modal-body">
          <span>Tahap {(activeStep ?? 0) + 1}</span>
          <strong>{selectedStep.label}</strong>
          <p>{selectedStep.detail}</p>
          <div>
            <small>Output</small>
            {selectedStep.code ? <code>{selectedStep.value}</code> : <b>{selectedStep.value}</b>}
          </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}

export function ConfidenceBreakdownPanel({ insight }: { insight: Insight }) {
  const [isOpen, setIsOpen] = useState(false);
  const rows = confidenceBreakdown.map((row) =>
    row.final ? { ...row, value: insight.confidence } : row
  );
  const topFactors = rows.filter((row) => !row.final).slice(0, 2);

  return (
    <Card title="Breakdown Confidence" eyebrow="Komponen keyakinan">
      <div className="insight-confidence-summary">
        <div className="insight-confidence-final">
          <span>Confidence akhir</span>
          <strong>{insight.confidence}%</strong>
        </div>
        {topFactors.map((row) => (
          <div className={row.final ? "insight-confidence-row final" : "insight-confidence-row"} key={row.label}>
            <div>
              <span>{row.label}</span>
              <strong>{row.value}%</strong>
            </div>
            <div className="insight-confidence-track" aria-hidden="true">
              <span style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => setIsOpen(true)} style={{ alignSelf: "flex-start", marginTop: "12px" }}>
        Lihat Detail Confidence
      </Button>

      <Modal open={isOpen} title="Detail Breakdown Confidence" onClose={() => setIsOpen(false)}>
        <div className="insight-confidence-list">
          {rows.map((row) => (
            <div className={row.final ? "insight-confidence-row final" : "insight-confidence-row"} key={row.label}>
              <div>
                <span>{row.label}</span>
                <strong>{row.value}%</strong>
              </div>
              <div className="insight-confidence-track" aria-hidden="true">
                <span style={{ width: `${row.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
}

export function EvidenceBalancePanel() {
  const [activeFilter, setActiveFilter] = useState<"supporting" | "confirming">("supporting");
  const [isOpen, setIsOpen] = useState(false);
  const activeItems = activeFilter === "supporting" ? supportingEvidence : confirmationEvidence;
  const title = activeFilter === "supporting" ? "Mendukung diagnosis" : "Perlu dikonfirmasi";

  return (
    <Card title="Bukti Pendukung vs Perlu Dikonfirmasi" eyebrow="Evaluasi objektif">
      <div className="insight-filter-row">
        <button className={activeFilter === "supporting" ? "active" : ""} onClick={() => setActiveFilter("supporting")} type="button">
          Mendukung
        </button>
        <button className={activeFilter === "confirming" ? "active" : ""} onClick={() => setActiveFilter("confirming")} type="button">
          Konfirmasi
        </button>
      </div>

      <div className={`insight-evidence-column ${activeFilter}`}>
        <strong>{title}</strong>
        <ul>
          {activeItems.slice(0, 2).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <Button variant="secondary" onClick={() => setIsOpen(true)} style={{ alignSelf: "flex-start", marginTop: "12px" }}>
        Lihat Semua Bukti
      </Button>

      <Modal open={isOpen} title={title} onClose={() => setIsOpen(false)}>
        <div className={`insight-evidence-column ${activeFilter}`}>
          <ul>
            {activeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </Card>
  );
}

export function OperationalImpactPanel({ insight }: { insight: Insight }) {
  const [isOpen, setIsOpen] = useState(false);
  const impact = [
    { label: "Aset terdampak", value: `Gerbong ${insight.carNumber}` },
    { label: "Subsistem", value: insight.subsystem },
    { label: "Dampak ke trainset", value: "Lokal" },
    { label: "Risiko operasional", value: insight.severity === "High" ? "Tinggi" : "Sedang" },
    { label: "Status perjalanan", value: "Perlu validasi" },
    { label: "Urgensi", value: "Sebelum perjalanan berikutnya" },
  ];

  return (
    <Card title="Dampak dan Cakupan Masalah" eyebrow="Konteks operasional">
      <div className="insight-impact-grid">
        {impact.slice(0, 4).map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => setIsOpen(true)} style={{ alignSelf: "flex-start", marginTop: "12px" }}>
        Lihat Detail Dampak
      </Button>

      <Modal open={isOpen} title="Detail Dampak Operasional" onClose={() => setIsOpen(false)}>
        <div className="insight-impact-grid modal-grid">
          {impact.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
}

export function SimilarInsightsPanel() {
  return (
    <Card title="Insight Serupa" eyebrow="Referensi kasus sebelumnya">
      <Table>
        <thead>
          <tr>
            <th>Aset</th>
            <th>Diagnosis</th>
            <th>Confidence</th>
            <th>Tindakan</th>
            <th>Hasil akhir</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {similarInsights.map((row) => (
            <tr key={`${row.asset}-${row.diagnosis}`}>
              <td>{row.asset}</td>
              <td>{row.diagnosis}</td>
              <td>{row.confidence}</td>
              <td>{row.action}</td>
              <td>{row.result}</td>
              <td>{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

export function InsightHistoryPanel({ insights }: { insights: Insight[] }) {
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const filteredInsights = severityFilter === "All" ? insights : insights.filter((insight) => insight.severity === severityFilter);
  const severityOptions = ["All", "High", "Medium", "Low"];

  return (
    <Card title="Daftar Insight Analitik" eyebrow="Data dari service insight">
      <div className="insight-filter-row">
        {severityOptions.map((option) => (
          <button
            className={severityFilter === option ? "active" : ""}
            key={option}
            onClick={() => setSeverityFilter(option)}
            type="button"
          >
            {option === "All" ? "Semua" : option}
          </button>
        ))}
      </div>

      <div className="insight-history-compact">
        {filteredInsights.map((row) => (
          <button className="insight-history-row" key={row.id} onClick={() => setSelectedInsight(row)} type="button">
            <span>
              <strong>{row.event}</strong>
              <small>{row.trainsetId} - C{row.carNumber}</small>
            </span>
            <span>{row.severity}</span>
            <span>{row.confidence}%</span>
            <span>{row.healthScore}%</span>
          </button>
        ))}
      </div>

      <Modal
        open={selectedInsight !== null}
        title={selectedInsight ? selectedInsight.event : "Detail insight"}
        onClose={() => setSelectedInsight(null)}
      >
        {selectedInsight ? (
          <div className="insight-modal-body">
            <span>{selectedInsight.trainsetId} - Gerbong {selectedInsight.carNumber}</span>
            <strong>{selectedInsight.diagnosis}</strong>
            <p>{selectedInsight.naturalInsight}</p>
            <div className="insight-impact-grid modal-grid">
              <div>
                <span>Severity</span>
                <strong>{selectedInsight.severity}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{selectedInsight.confidence}%</strong>
              </div>
              <div>
                <span>Health</span>
                <strong>{selectedInsight.healthScore}%</strong>
              </div>
              <div>
                <span>Rekomendasi</span>
                <strong>{selectedInsight.recommendation}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}

export function FollowupStatusPanel() {
  return (
    <Card title="Status Tindak Lanjut/SPK" eyebrow="Koneksi keputusan operasional">
      <div className="insight-followup-status">
        <div>
          <span>Status saat ini</span>
          <strong>Draft SPK direkomendasikan</strong>
        </div>
        <div>
          <span>Target tindak lanjut</span>
          <strong>Inspeksi brake cylinder dan control valve</strong>
        </div>
        <div>
          <span>Owner</span>
          <strong>Supervisor Maintenance</strong>
        </div>
      </div>
    </Card>
  );
}

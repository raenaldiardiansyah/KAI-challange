"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Insight } from "@/types/insight";
import Link from "next/link";

const tabs = [
  "Input Sensor",
  "Evaluasi Rule",
  "Event Terdeteksi",
  "Insight JSON",
  "Natural Insight",
] as const;

export function StructuredInsightViewer({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Input Sensor");

  const sensorRows = Object.entries(insight.evidence);
  const workOrderUrl = `/work-order?trainset=${encodeURIComponent(insight.trainsetId)}&car=${insight.carNumber}&subsystem=${encodeURIComponent(insight.subsystem)}&source=insight-analytic`;

  return (
    <>
      <Card title="Detail Proses Analitik" eyebrow="Output analitik backend" className="insight-process-card">
        <div className="insight-process-summary">
          <div>
            <strong>{insight.event}</strong>
            <p>
              Proses lengkap berisi input sensor, evaluasi rule, event terdeteksi,
              JSON backend, dan natural insight. Dibuka hanya saat operator butuh audit teknis.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} variant="secondary">
            Lihat Detail Proses Analitik
          </Button>
        </div>
      </Card>

      {open ? (
        <div className="insight-process-dialog-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            aria-labelledby="insight-process-dialog-title"
            aria-modal="true"
            className="insight-process-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="insight-process-dialog-header">
              <div>
                <span>{insight.trainsetId} - Gerbong {insight.carNumber} - {insight.severity}</span>
                <h3 id="insight-process-dialog-title">Detail Proses Analitik</h3>
              </div>
              <div>
                <strong>{insight.confidence}% confidence</strong>
                <Button onClick={() => setOpen(false)} variant="secondary">Tutup</Button>
              </div>
            </header>

            <div className="insight-process-tabs" role="tablist" aria-label="Detail proses analitik">
              {tabs.map((tab) => (
                <button
                  aria-selected={activeTab === tab}
                  className={activeTab === tab ? "active" : ""}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="insight-process-dialog-body">
              {activeTab === "Input Sensor" ? (
                <div className="insight-process-table">
                  {sensorRows.map(([key, value]) => (
                    <div key={key}>
                      <span>{key}</span>
                      <strong>{String(value)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "Evaluasi Rule" ? (
                <div className="insight-process-text-grid">
                  <div>
                    <span>Rule utama</span>
                    <strong>Brake Cylinder di bawah median trainset</strong>
                    <p>Nilai Brake Cylinder dibandingkan dengan median harian dan batas normal operasional.</p>
                  </div>
                  <div>
                    <span>Validasi pembanding</span>
                    <strong>Brake Pipe tetap stabil</strong>
                    <p>Tekanan utama tidak ikut turun, sehingga sistem membaca masalah sebagai gangguan lokal.</p>
                  </div>
                </div>
              ) : null}

              {activeTab === "Event Terdeteksi" ? (
                <div className="insight-process-text-grid">
                  <div>
                    <span>Diagnosis</span>
                    <strong>{insight.event}</strong>
                    <p>{insight.diagnosis}</p>
                  </div>
                  <div>
                    <span>Rekomendasi</span>
                    <strong>Sebelum perjalanan berikutnya</strong>
                    <p>{insight.recommendation}</p>
                  </div>
                </div>
              ) : null}

              {activeTab === "Insight JSON" ? (
                <pre>{JSON.stringify(insight.structuredInsight, null, 2)}</pre>
              ) : null}

              {activeTab === "Natural Insight" ? (
                <div className="insight-process-natural">
                  <strong>{insight.risk}</strong>
                  <p>{insight.naturalInsight}</p>
                </div>
              ) : null}
            </div>

            <footer className="insight-process-dialog-footer">
              <Button variant="secondary" onClick={() => setActiveTab("Insight JSON")}>Lihat JSON</Button>
              <Button asChild>
                <Link href={workOrderUrl}>Buat Draft SPK</Link>
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Tutup</Button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

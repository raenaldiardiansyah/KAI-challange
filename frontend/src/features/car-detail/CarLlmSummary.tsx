"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CarDetail } from "@/types/car";
import type { Insight } from "@/types/insight";

type CarLlmSummaryProps = {
  car: CarDetail;
  insight?: Insight;
};

export function CarLlmSummary({ car, insight }: CarLlmSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const carCode = car.backendCarId ?? car.id;
  const mainSubsystem = insight?.subsystem ?? car.subsystems[0]?.subsystem ?? "Brake System";
  const confidence = insight?.confidence ?? 86;
  const recommendation = insight?.recommendation
    ?? `Validasi ${mainSubsystem} pada ${carCode} dan bandingkan pembacaan sensor dengan unit referensi.`;
  const summary = insight?.naturalInsight
    ?? `${mainSubsystem} pada ${carCode} menjadi perhatian utama. Sistem menyarankan validasi sensor dan inspeksi komponen sebelum perjalanan berikutnya.`;
  const compactSummary = insight
    ? `${mainSubsystem} ${carCode}: ${car.healthScore}% health, ${confidence}% confidence. Validasi sensor dan inspeksi komponen utama.`
    : `${mainSubsystem} ${carCode}: perlu validasi sensor sebelum perjalanan berikutnya.`;

  return (
    <>
      <Card title="Insight LLM" eyebrow="Narasi operasional" className="summary-accent-card summary-tone-info car-llm-summary-card">
        <button className="car-llm-summary-content car-llm-summary-clickable" onClick={() => setIsOpen(true)} type="button">
          <div className="car-llm-summary-main">
            <span>Masalah Utama</span>
            <strong>{insight?.diagnosis ?? `${mainSubsystem} perlu divalidasi`}</strong>
            <p>{compactSummary}</p>
          </div>
          <div className="car-llm-summary-metrics">
            <span>
              Keyakinan
              <strong>{confidence}%</strong>
            </span>
            <span>
              Subsystem
              <strong>{mainSubsystem}</strong>
            </span>
          </div>
          <div className="car-llm-recommendation">
            <span>Rekomendasi singkat</span>
            <strong>{recommendation}</strong>
          </div>
          <small className="car-llm-open-hint">Klik untuk melihat narasi lengkap</small>
        </button>
      </Card>

      {isOpen && typeof document !== "undefined" ? createPortal((
        <div className="car-llm-dialog-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <section
            aria-labelledby="car-llm-dialog-title"
            aria-modal="true"
            className="car-llm-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="car-llm-dialog-header">
              <div>
                <span>{car.trainsetId} - {carCode}</span>
                <h3 id="car-llm-dialog-title">Detail Insight LLM</h3>
              </div>
              <button type="button" onClick={() => setIsOpen(false)}>Tutup</button>
            </header>

            <div className="car-llm-dialog-body">
              <section>
                <span>Diagnosis</span>
                <strong>{insight?.diagnosis ?? `${mainSubsystem} perlu divalidasi`}</strong>
                <p>{summary}</p>
              </section>
              <section>
                <span>Rekomendasi</span>
                <strong>{recommendation}</strong>
                <p>Fokuskan pemeriksaan pada {mainSubsystem}, validasi pembacaan sensor, dan bandingkan dengan unit referensi sebelum keputusan operasi.</p>
              </section>
              <div className="car-llm-dialog-metrics">
                <span><strong>{confidence}%</strong>Keyakinan</span>
                <span><strong>{car.healthScore}%</strong>Kesehatan</span>
                <span><strong>{mainSubsystem}</strong>Subsystem</span>
              </div>
            </div>

            <footer className="action-row">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Tutup</Button>
            </footer>
          </section>
        </div>
      ), document.body) : null}
    </>
  );
}

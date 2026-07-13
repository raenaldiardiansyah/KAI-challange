"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus } from "@/types/common";
import { Button } from "@/components/ui/Button";
import styles from "./AlarmDetail.module.css";

const statusLabel: Record<AlarmStatus, string> = {
  Open: "Terbuka",
  Acknowledged: "Diketahui",
  Closed: "Selesai",
  "Auto Cleared": "Selesai Otomatis"
};

export function AlarmDetail({ alarm, onResolve, resolving }: { alarm: Alarm; onResolve?: (id: string) => void; resolving?: boolean }) {
  const [tab, setTab] = useState<"summary" | "evidence" | "diagnosis">("summary");
  const observed = alarm.observedValue ?? "Belum tersedia";
  const threshold = alarm.thresholdValue ?? "Belum tersedia";
  const deviation = typeof alarm.observedValue === "number" && typeof alarm.thresholdValue === "number"
    ? alarm.observedValue - alarm.thresholdValue
    : null;
  const telemetryUrl = `/telemetry-explorer?${new URLSearchParams({
    trainset: alarm.trainsetId,
    ...(alarm.carId ? { car: alarm.carId } : {}),
    ...(alarm.subsystemCode ? { subsystem: alarm.subsystemCode } : {}),
    ...(alarm.signalName ? { signal: alarm.signalName } : {})
  }).toString()}`;
  return (
    <Card title={alarm.message} eyebrow={alarm.id} className="alarm-detail-card">
      <div className="alarm-detail-panel">
        <div className="alarm-detail-kpis">
          <span><small>Aset</small><strong>{alarm.trainsetCode ?? alarm.trainsetId} C{alarm.carNumber}</strong></span>
          <span><small>Subsistem</small><strong>{alarm.subsystem}</strong></span>
          <span><small>Status</small><strong>{statusLabel[alarm.status]}</strong></span>
          <span><small>Terdeteksi</small><strong>{alarm.detectedAt}</strong></span>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Detail alarm">
          <button aria-selected={tab === "summary"} onClick={() => setTab("summary")} role="tab">Ringkasan</button>
          <button aria-selected={tab === "evidence"} onClick={() => setTab("evidence")} role="tab">Evidence RAMS</button>
          <button aria-selected={tab === "diagnosis"} onClick={() => setTab("diagnosis")} role="tab">Diagnosis</button>
        </div>

        {tab === "summary" ? (
          <section>
            <span>Evidence ringkas</span>
            <p>Alarm {alarm.title ?? alarm.message} terhubung ke {alarm.subsystem} pada {alarm.trainsetCode ?? alarm.trainsetId} C{alarm.carNumber}.</p>
          </section>
        ) : null}

        {tab === "evidence" ? (
          <section>
            <div className={styles.grid}>
              <div className={styles.item}><span>Signal</span><strong>{alarm.signalName ?? "Belum tersedia"}</strong></div>
              <div className={styles.item}><span>Observed</span><strong>{String(observed)}</strong></div>
              <div className={styles.item}><span>Threshold</span><strong>{String(threshold)}</strong></div>
              <div className={styles.item}><span>Deviation</span><strong>{deviation === null ? "Belum tersedia" : `${deviation >= 0 ? "+" : ""}${deviation.toFixed(2)}`}</strong></div>
              <div className={styles.item}><span>First Seen</span><strong>{alarm.detectedAt}</strong></div>
              <div className={styles.item}><span>Last Seen</span><strong>{alarm.lastUpdate}</strong></div>
            </div>
            <details className={styles.raw}>
              <summary>Raw Evidence JSON</summary>
              <pre>{alarm.evidence == null ? "Belum tersedia" : JSON.stringify(alarm.evidence, null, 2)}</pre>
            </details>
          </section>
        ) : null}

        {tab === "diagnosis" ? (
          <section>
            <div className={styles.grid}>
              <div className={styles.item}><span>Confidence</span><strong>{alarm.diagnosticConfidence ?? "Belum tersedia"}</strong></div>
              <div className={styles.item}><span>Scope</span><strong>{alarm.diagnosticScope ?? "Belum tersedia"}</strong></div>
              <div className={styles.item}><span>Affected cars</span><strong>{alarm.affectedCars?.map((item) => item.carId).join(", ") || "Belum tersedia"}</strong></div>
              <div className={styles.item}><span>Cases</span><strong>{alarm.diagnosticCases?.join(", ") || "Belum tersedia"}</strong></div>
            </div>
            {alarm.diagnosticEvidence?.length ? <ul className={styles.list}>{alarm.diagnosticEvidence.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            <p>{alarm.recommendation ?? "Rekomendasi diagnosis belum tersedia dari RAMS."}</p>
          </section>
        ) : null}
        <div className={styles.actions}>
          <Link className={styles.telemetryLink} href={telemetryUrl}>Buka Data Mentah</Link>
          {alarm.status === "Acknowledged" && onResolve ? (
            <Button disabled={resolving} onClick={() => onResolve(alarm.id)}>
              {resolving ? "Menyelesaikan..." : "Tandai Selesai"}
            </Button>
          ) : null}
        </div>

        <section>
          <span>Lifecycle alarm</span>
          <div className="alarm-detail-timeline">
            <b>Deteksi awal</b>
            <b>{alarm.status === "Open" ? "Menunggu acknowledge" : "Sudah masuk antrean tindak lanjut"}</b>
            <b>{alarm.status === "Closed" || alarm.status === "Auto Cleared" ? "Selesai" : "Belum selesai"}</b>
          </div>
        </section>

        <section>
          <span>Tindak lanjut disarankan</span>
          <p>
            Buka Evidence untuk melihat konteks Gerbong, lalu buat SPK jika alarm masih aktif atau berulang pada subsistem yang sama.
          </p>
        </section>
      </div>
    </Card>
  );
}

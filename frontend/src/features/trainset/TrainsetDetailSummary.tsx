"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Trainset } from "@/types/trainset";
import { MapPin, WifiHigh, WifiSlash, Train } from "@phosphor-icons/react/dist/ssr";
import styles from "./TrainsetDetailSummary.module.css";

export function TrainsetDetailSummary({ trainset }: { trainset: Trainset }) {
  const [open, setOpen] = useState(false);
  const isOnline = trainset.dataStatus === "Online";
  const breakdown = trainset.healthBreakdown;

  const chipStyle: React.CSSProperties = {
    background: "var(--surface-3, #f1f5f9)",
    color: "var(--text-strong, #0f172a)",
    padding: "8px 16px",
    borderRadius: "99px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    flex: "1 1 200px"
  };

  return (
    <Card title={trainset.name} eyebrow="Ringkasan armada terpilih" className={`summary-accent-card trainset-detail-summary-card summary-tone-${isOnline ? "success" : "danger"} ${styles.root}`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px", width: "100%" }}>

        {/* Status Data */}
        <div style={chipStyle}>
          {isOnline ? <WifiHigh size={16} color="#10b981" weight="bold" /> : <WifiSlash size={16} color="#ef4444" weight="bold" />}
          <span style={{ color: isOnline ? "#10b981" : "#ef4444" }}>
            {trainset.dataStatus}
          </span>
        </div>

        {/* Lokasi */}
        <div style={chipStyle}>
          <MapPin size={16} weight="bold" color="#3b82f6" />
          {trainset.location}
        </div>

        {/* Kesehatan */}
        <div style={chipStyle}>
          <span>Kesehatan</span>
          <span className="percent-with-delta trainset-percent-row">
            <span className="percent-value">{trainset.healthScore}%</span>
            <MetricDelta value={trainset.healthScore} compact />
          </span>
        </div>

        {/* Total Gerbong */}
        <div style={chipStyle}>
          <Train size={16} weight="bold" />
          <span>{trainset.totalCars} Gerbong</span>
          <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "4px" }}>
            (Tetap)
          </span>
        </div>

      </div>
      <div className={styles.strip} aria-label="Breakdown kesehatan armada">
        <button onClick={() => setOpen((value) => !value)}><strong>{trainset.onlineCars ?? (trainset.online ? trainset.totalCars : 0)}</strong> Online</button>
        <button onClick={() => setOpen((value) => !value)}><strong>{breakdown?.critical ?? 0}</strong> Critical</button>
        <button onClick={() => setOpen((value) => !value)}><strong>{breakdown?.warning ?? 0}</strong> Warning</button>
        <button onClick={() => setOpen((value) => !value)}><strong>{breakdown?.offline ?? (trainset.online ? 0 : trainset.totalCars)}</strong> Offline</button>
      </div>
      {open ? (
        <aside className={styles.popover} aria-label="Detail breakdown kesehatan">
          <header><strong>Health Breakdown</strong><button onClick={() => setOpen(false)}>Tutup</button></header>
          <div className={styles.summary}>
            <span><strong>{breakdown?.critical ?? 0}</strong>Critical</span>
            <span><strong>{breakdown?.warning ?? 0}</strong>Warning</span>
            <span><strong>{breakdown?.watch ?? 0}</strong>Watch</span>
            <span><strong>{breakdown?.offline ?? 0}</strong>Offline</span>
          </div>
          <div className={styles.cars}>
            {trainset.carHealthSummary?.length ? trainset.carHealthSummary.map((car) => (
              <div className={styles.car} key={car.carId} title={`Backend ID: ${car.carId}`}>
                <strong>{car.displayCode}</strong><span>{car.status} · {car.dataStatus}</span><strong>{car.healthScore == null ? "—" : `${car.healthScore}%`}</strong>
              </div>
            )) : <p className={styles.meta}>Rincian per gerbong belum tersedia.</p>}
          </div>
          <p className={styles.meta}>Sumber: {trainset.healthSource ?? "Belum tersedia"} · Dihitung: {trainset.healthGeneratedAt ?? trainset.lastUpdate}</p>
        </aside>
      ) : null}
    </Card>
  );
}

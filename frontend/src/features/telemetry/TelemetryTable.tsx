"use client";

import { Card } from "@/components/ui/Card";
import { Fragment, useState, type ReactNode } from "react";
import type { TelemetryRecordView } from "@/adapters/telemetryAdapter";
import styles from "./TelemetryWorkspace.module.css";

type ColumnKey = "time" | "trainset" | "car" | "subsystem" | "signal" | "value" | "unit" | "quality" | "id" | "topic";
const columnLabels: Record<ColumnKey, string> = {
  time: "Waktu", trainset: "Trainset", car: "Gerbong", subsystem: "Subsistem", signal: "Signal",
  value: "Nilai", unit: "Unit", quality: "Kualitas", id: "Record ID", topic: "Source topic"
};
const defaultVisible: Record<ColumnKey, boolean> = {
  time: true, trainset: true, car: true, subsystem: true, signal: true,
  value: true, unit: true, quality: true, id: false, topic: false
};

function QualityBadge({ value }: { value: string }) {
  const kind = value === "GOOD" ? styles.qualityGood : value === "BAD" ? styles.qualityBad : styles.qualityOther;
  return <span className={`${styles.quality} ${kind}`}>{value || "N/A"}</span>;
}

export function TelemetryTable({ records = [] }: { records?: TelemetryRecordView[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(defaultVisible);
  const data = records.slice(-100).reverse();
  const visibleCount = Object.values(visible).filter(Boolean).length;

  const cell = (key: ColumnKey, row: TelemetryRecordView) => {
    if (!visible[key]) return null;
    const optionalClass = ["trainset", "car", "subsystem", "id", "topic"].includes(key) ? styles.compactOptional : "";
    const content: Record<ColumnKey, ReactNode> = {
      time: row.eventTimeLabel,
      trainset: row.trainsetLabel,
      car: row.carLabel,
      subsystem: row.subsystem,
      signal: row.signalName,
      value: <span className={styles.value}>{row.displayValue}</span>,
      unit: row.unit ?? "—",
      quality: <QualityBadge value={row.qualityStatus} />,
      id: row.id,
      topic: row.sourceTopic ?? "—"
    };
    return <td key={key} className={optionalClass}>{content[key]}</td>;
  };

  return (
    <Card className={styles.tableCard} title="Data Log Mentah (Raw Telemetry)" eyebrow={`${data.length} dari maksimal 100 baris terbaru`} action={
      <div className={styles.tableActions}>
        <div className={styles.columnMenu}>
          <button className={styles.columnMenuButton} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Atur kolom</button>
          {menuOpen ? (
            <div className={styles.columnPopover} role="group" aria-label="Visibilitas kolom">
              {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                <label key={key}>
                  <input type="checkbox" checked={visible[key]} onChange={() => setVisible((current) => ({ ...current, [key]: !current[key] }))} />
                  {columnLabels[key]}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    }>
      <div className={styles.tableViewport}>
        <table>
        <thead>
          <tr>
            {(Object.keys(columnLabels) as ColumnKey[]).map((key) => visible[key] ? (
              <th key={key} className={["trainset", "car", "subsystem", "id", "topic"].includes(key) ? styles.compactOptional : ""}>{columnLabels[key]}</th>
            ) : null)}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <Fragment key={row.id}>
              <tr key={row.id} data-expandable="true" aria-expanded={expandedId === row.id} onClick={() => setExpandedId((current) => current === row.id ? null : row.id)}>
                {(Object.keys(columnLabels) as ColumnKey[]).map((key) => cell(key, row))}
              </tr>
              {expandedId === row.id ? (
                <tr className={styles.detailsRow} key={`${row.id}-detail`}>
                  <td colSpan={visibleCount}>
                    <dl className={styles.detailsGrid}>
                      <div><dt>Record ID</dt><dd>{row.id}</dd></div>
                      <div><dt>Trainset backend</dt><dd>{row.trainsetId}</dd></div>
                      <div><dt>Car backend</dt><dd>{row.carId ?? "Tidak tersedia"}</dd></div>
                      <div><dt>Timestamp penuh</dt><dd>{row.eventTime}</dd></div>
                      <div><dt>Value float</dt><dd>{row.valueFloat ?? "Tidak tersedia"}</dd></div>
                      <div><dt>Value text</dt><dd>{row.valueText ?? "Tidak tersedia"}</dd></div>
                      <div><dt>Value mentah</dt><dd>{row.value ?? "Tidak tersedia"}</dd></div>
                      <div><dt>Source topic</dt><dd>{row.sourceTopic ?? "Tidak tersedia"}</dd></div>
                    </dl>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
          {data.length === 0 ? <tr><td className={styles.empty} colSpan={visibleCount}>Data telemetry belum tersedia untuk filter ini.</td></tr> : null}
        </tbody>
        </table>
      </div>
    </Card>
  );
}

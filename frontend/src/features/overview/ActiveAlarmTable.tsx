"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus, Severity } from "@/types/common";

const severityLabel: Record<Severity, string> = {
  Critical: "Kritis",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
  Normal: "Normal"
};

const statusLabel: Record<AlarmStatus, string> = {
  Open: "Terbuka",
  Acknowledged: "Diakui",
  Closed: "Ditutup",
  "Auto Cleared": "Selesai Otomatis"
};

const alarmMessageLabel: Record<string, string> = {
  "Brake Cylinder pressure deviation detected": "Deviasi tekanan Brake Cylinder melewati ambang batas",
  "Cabin temperature above comfort band": "Suhu kabin melewati rentang kenyamanan",
  "Door controller telemetry delayed": "Telemetri pengendali pintu terlambat"
};

export function ActiveAlarmTable({ alarms }: { alarms: Alarm[] }) {
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(alarms.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentAlarms = alarms.slice(startIndex, startIndex + pageSize);

  const handleToggleSize = () => {
    setPageSize(prev => prev === 5 ? 10 : 5);
    setCurrentPage(1);
  };

  return (
    <Card 
      title="Alarm Aktif" 
      eyebrow="Terbuka dan diketahui"
    >
      <Table>
        <thead><tr><th>Alarm</th><th>Aset</th><th>Tingkat</th><th>Status</th></tr></thead>
        <tbody>
          {currentAlarms.map((alarm) => (
            <tr key={alarm.id}>
              <td>{alarmMessageLabel[alarm.message] ?? alarm.message}</td>
              <td>{alarm.trainsetId} Gerbong {alarm.carNumber}</td>
              <td><Badge label={severityLabel[alarm.severity]} severity={alarm.severity} /></td>
              <td>{statusLabel[alarm.status]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {totalPages > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", marginTop: "16px", fontSize: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
          <span style={{ color: "var(--muted)" }}>Menampilkan {startIndex + 1}-{Math.min(startIndex + pageSize, alarms.length)} dari {alarms.length}</span>
          <div style={{ textAlign: "center" }}>
            <button 
              onClick={handleToggleSize}
              style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              {pageSize === 5 ? "Lihat lebih banyak" : "Lihat lebih sedikit"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: "4px 10px", background: currentPage === 1 ? "transparent" : "var(--surface-2)", color: currentPage === 1 ? "var(--muted)" : "var(--text)", border: "1px solid var(--line)", borderRadius: "4px", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: "bold" }}
            >
              Prev
            </button>
            <span style={{ padding: "0 4px", fontWeight: "bold", color: "var(--text)" }}>{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: "4px 10px", background: currentPage === totalPages ? "transparent" : "var(--surface-2)", color: currentPage === totalPages ? "var(--muted)" : "var(--text)", border: "1px solid var(--line)", borderRadius: "4px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontWeight: "bold" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

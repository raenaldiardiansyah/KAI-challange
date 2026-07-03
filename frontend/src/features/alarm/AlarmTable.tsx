"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { Alarm } from "@/types/alarm";
import { formatDate } from "@/utils/formatDate";

export function AlarmTable({ alarms }: { alarms: Alarm[] }) {
  const [visibleCount, setVisibleCount] = useState(10);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "Open": return "Terbuka";
      case "Acknowledged": return "Diketahui";
      case "Closed": return "Selesai";
      default: return status;
    }
  };

  const visibleAlarms = alarms.slice(0, visibleCount);

  return (
    <Card title="Daftar Alarm" eyebrow="Semua peringatan sistem">
      <Table>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Armada</th>
            <th>Gerbong</th>
            <th>Subsistem</th>
            <th>Pesan Alarm</th>
            <th>Tingkat</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {visibleAlarms.map((alarm) => (
            <tr key={alarm.id}>
              <td style={{ fontSize: "12px" }}>{formatDate(alarm.detectedAt)}</td>
              <td>{alarm.trainsetId}</td>
              <td>C{alarm.carNumber}</td>
              <td>{alarm.subsystem}</td>
              <td style={{ maxWidth: "200px" }}>{alarm.message}</td>
              <td><Badge label={alarm.severity} severity={alarm.severity} /></td>
              <td>
                <span style={{ 
                  fontSize: "12px", 
                  fontWeight: "bold",
                  color: alarm.status === "Open" ? "#b91c1c" : (alarm.status === "Acknowledged" ? "#d97706" : "#10b981")
                }}>
                  {getStatusText(alarm.status)}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  {alarm.status === "Open" && (
                    <Button variant="secondary" className="table-mini-button">Acknowledge</Button>
                  )}
                  <Button variant="ghost" className="table-mini-button">Evidence</Button>
                  <Button className="table-mini-button">Buat SPK</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {visibleCount < alarms.length && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <Button variant="secondary" onClick={() => setVisibleCount((prev) => prev + 10)}>
            Lihat lebih banyak
          </Button>
        </div>
      )}
    </Card>
  );
}

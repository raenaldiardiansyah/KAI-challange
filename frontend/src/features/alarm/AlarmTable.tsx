"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { Alarm } from "@/types/alarm";
import { formatDate } from "@/utils/formatDate";
import { useRouter } from "next/navigation";

export function AlarmTable({
  alarms,
  selectedAlarmId,
  onSelectAlarm
}: {
  alarms: Alarm[];
  selectedAlarmId?: string;
  onSelectAlarm?: (id: string) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const router = useRouter();
  
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
            <tr
              key={alarm.id}
              className={selectedAlarmId === alarm.id ? "alarm-row selected" : "alarm-row"}
              onClick={() => onSelectAlarm?.(alarm.id)}
            >
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
              <td onClick={(event) => event.stopPropagation()}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {alarm.status === "Open" && (
                    <Button variant="secondary" className="table-mini-button" onClick={() => alert(`Alarm ${alarm.id} disetujui (Acknowledged)`)}>Acknowledge</Button>
                  )}
                  <Button variant="ghost" className="table-mini-button" onClick={() => router.push(`/car-detail?car=${alarm.carNumber}`)}>Evidence</Button>
                  <Button className="table-mini-button" onClick={() => router.push('/work-order')}>Buat SPK</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {alarms.length === 0 ? (
        <div className="empty-state">Tidak ada alarm yang cocok dengan pencarian.</div>
      ) : null}
      
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

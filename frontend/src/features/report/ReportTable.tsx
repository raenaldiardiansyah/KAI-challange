"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { ReportFilterValues } from "@/types/reportFilter";

interface ReportTableProps {
  filter: ReportFilterValues;
}

export function ReportTable({ filter }: ReportTableProps) {
  const data = [
    { id: "REP-07-26-01", date: "2026-07-01", type: "Bulanan", title: "Laporan Performa Armada Juni 2026", status: "Ready" },
    { id: "REP-07-26-02", date: "2026-07-01", type: "Analitik", title: "Ringkasan Anomali Subsistem Brake", status: "Ready" },
    { id: "REP-07-26-03", date: "2026-07-02", type: "Harian", title: "Daily Shift Report 02 Juli", status: "Generating..." },
    { id: "REP-07-26-04", date: "2026-07-03", type: "Harian", title: "Daily Shift Report 03 Juli", status: "Ready" },
    { id: "REP-06-26-05", date: "2026-06-28", type: "Mingguan", title: "Laporan Mingguan Armada W26", status: "Ready" },
    { id: "REP-06-26-06", date: "2026-06-15", type: "Bulanan", title: "Laporan Performa Armada Mei 2026", status: "Ready" },
    { id: "REP-05-26-07", date: "2026-05-01", type: "Analitik", title: "Ringkasan Anomali Subsistem HVAC", status: "Ready" },
    { id: "REP-03-26-08", date: "2026-03-15", type: "Bulanan", title: "Laporan Performa Armada Februari 2026", status: "Ready" },
  ];

  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return data.filter((row) => {
      const rowDate = new Date(row.date);

      switch (filter.period) {
        case "today":
          return rowDate >= today;
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return rowDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return rowDate >= monthAgo;
        }
        case "year": {
          const yearStart = new Date(today.getFullYear(), 0, 1);
          return rowDate >= yearStart;
        }
        default:
          return true;
      }
    });
  }, [filter.period]);

  return (
    <Card title="Arsip Laporan" eyebrow="Unduh Laporan Format Dokumen">
      <Table>
        <thead>
          <tr>
            <th>ID Dokumen</th>
            <th>Tanggal Generate</th>
            <th>Tipe Laporan</th>
            <th>Judul / Deskripsi</th>
            <th>Status</th>
            <th>Unduh</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.date}</td>
              <td>{row.type}</td>
              <td>{row.title}</td>
              <td>
                <span style={{ 
                  color: row.status === "Ready" ? "#10b981" : "#d97706",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {row.status}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <Button variant="ghost" className="table-mini-button" disabled={row.status !== "Ready"} icon={<DownloadSimple size={12} />}>
                    Simulasi PDF (Belum terhubung backend)
                  </Button>
                  <Button variant="secondary" className="table-mini-button" disabled={row.status !== "Ready"} icon={<DownloadSimple size={12} />}>
                    Simulasi Excel (Belum terhubung backend)
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

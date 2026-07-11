"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { Report } from "@/types/report";
import type { ReportFilterValues } from "@/types/reportFilter";

interface ReportTableProps {
  filter: ReportFilterValues;
  reports: Report[];
}

export function ReportTable({ filter, reports }: ReportTableProps) {
  const [exportStatus, setExportStatus] = useState("");
  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return reports.filter((row) => {
      const rowDate = new Date(row.generatedAt);

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
  }, [filter.period, reports]);

  return (
    <Card
      title="Arsip Laporan"
      eyebrow="Unduh Laporan Format Dokumen"
      action={exportStatus ? <span className="report-export-status">{exportStatus}</span> : null}
    >
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
              <td>{new Date(row.generatedAt).toLocaleDateString("id-ID")}</td>
              <td>{row.type}</td>
              <td>
                <strong>{row.title}</strong>
                <p>{row.summary}</p>
              </td>
              <td>
                <span style={{ 
                  color: "#10b981",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  Siap
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <Button
                    variant="ghost"
                    className="table-mini-button"
                    icon={<DownloadSimple size={12} />}
                    onClick={() => setExportStatus(`${row.id}: PDF menunggu integrasi backend produksi.`)}
                  >
                    Simulasi PDF (Belum terhubung backend)
                  </Button>
                  <Button
                    variant="secondary"
                    className="table-mini-button"
                    icon={<DownloadSimple size={12} />}
                    onClick={() => setExportStatus(`${row.id}: Excel menunggu integrasi backend produksi.`)}
                  >
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

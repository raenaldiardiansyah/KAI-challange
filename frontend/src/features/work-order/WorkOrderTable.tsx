"use client";

import { useMemo, useState } from "react";
import { DotsThreeVertical } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import type { Severity } from "@/types/common";

export type SpkStatus = "open" | "in-progress" | "completed" | "overdue";

export type SpkRow = {
  id: string;
  source: string;
  eventCode: string;
  asset: string;
  trainsetId: string;
  carNumber: number;
  subsystem: string;
  task: string;
  priority: Severity;
  status: SpkStatus;
  deadline: string;
  assignee: string;
  evidence: string[];
  recommendation: string;
  notes: string;
};

const priorityLabel: Record<Severity, string> = {
  Critical: "Kritis",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
  Normal: "Normal"
};

export function getStatusMeta(status: SpkStatus) {
  switch (status) {
    case "open": return { bg: "#fee2e2", color: "#b91c1c", label: "Terbuka" };
    case "in-progress": return { bg: "#fef3c7", color: "#b54708", label: "Dikerjakan" };
    case "completed": return { bg: "#dcfce7", color: "#047857", label: "Selesai" };
    case "overdue": return { bg: "#7f1d1d", color: "#fca5a5", label: "Overdue" };
  }
}

function getStatusActions(status: SpkStatus): Array<{ label: string; nextStatus: SpkStatus }> {
  switch (status) {
    case "open": return [{ label: "Mulai Dikerjakan", nextStatus: "in-progress" }];
    case "in-progress": return [{ label: "Tandai Selesai", nextStatus: "completed" }];
    case "overdue": return [
      { label: "Lanjutkan Dikerjakan", nextStatus: "in-progress" },
      { label: "Tandai Selesai", nextStatus: "completed" }
    ];
    case "completed": return [];
  }
}

export function WorkOrderTable({
  rows,
  selectedId,
  onSelect,
  onPriorityChange,
  onStatusChange
}: {
  rows: SpkRow[];
  selectedId: string;
  onSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: Severity) => void;
  onStatusChange: (id: string, status: SpkStatus) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const matchPriority = priorityFilter === "all" || row.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [priorityFilter, rows, statusFilter]);

  return (
    <Card
      title="Daftar Surat Perintah Kerja (SPK)"
      eyebrow="Queue tindak lanjut"
      action={
        <div className="spk-table-filters">
          <Select aria-label="Filter status SPK" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Semua Status</option>
            <option value="open">Terbuka</option>
            <option value="in-progress">Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select aria-label="Filter prioritas SPK" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="all">Semua Prioritas</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>
      }
    >
      <Table>
        <thead>
          <tr>
            <th>ID SPK</th>
            <th>Sumber</th>
            <th>Armada & Gerbong</th>
            <th>Tugas</th>
            <th>Prioritas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => {
            const status = getStatusMeta(row.status);
            const isSelected = row.id === selectedId;
            const statusActions = getStatusActions(row.status);

            return (
              <tr
                key={row.id}
                className={isSelected ? "spk-row selected" : "spk-row"}
                onClick={() => onSelect(row.id)}
              >
                <td><strong>{row.id}</strong></td>
                <td>
                  <span className="table-primary-text">{row.source}</span>
                  <small>{row.eventCode}</small>
                </td>
                <td>{row.asset}</td>
                <td>{row.task}</td>
                <td><Badge label={priorityLabel[row.priority]} severity={row.priority} /></td>
                <td>
                  <span className="spk-status-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                </td>
                <td onClick={(event) => event.stopPropagation()}>
                  <details className="row-action-menu">
                    <summary aria-label={`Aksi ${row.id}`}>
                      <DotsThreeVertical size={18} weight="bold" />
                    </summary>
                    <div className="row-action-content">
                      <button type="button" onClick={() => onSelect(row.id)}>Lihat Detail</button>
                      {statusActions.length > 0 ? (
                        <div className="row-action-group">
                          <span>Progress Status</span>
                          {statusActions.map((action) => (
                            <button
                              key={action.nextStatus}
                              type="button"
                              onClick={() => onStatusChange(row.id, action.nextStatus)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="row-action-note">Status sudah selesai</div>
                      )}
                      <div className="row-action-group">
                        <span>Override Prioritas</span>
                        {(["Critical", "High", "Medium", "Low"] as Severity[]).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            className={row.priority === priority ? "selected" : ""}
                            onClick={() => onPriorityChange(row.id, priority)}
                          >
                            {priorityLabel[priority]}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => onSelect(row.id)}>Lihat Evidence</button>
                      <button type="button" onClick={() => onSelect(row.id)}>Buat Catatan</button>
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {filteredRows.length === 0 ? (
        <div className="empty-state">Tidak ada SPK yang cocok dengan filter saat ini.</div>
      ) : null}

      <div className="spk-table-footer">
        <Button variant="ghost" className="table-mini-button">Export</Button>
        <Button variant="secondary" className="table-mini-button">Refresh Queue</Button>
      </div>
    </Card>
  );
}

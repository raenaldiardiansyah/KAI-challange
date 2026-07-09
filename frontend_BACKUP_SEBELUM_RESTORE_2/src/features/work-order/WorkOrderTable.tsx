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
  const [footerMessage, setFooterMessage] = useState("");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const matchPriority = priorityFilter === "all" || row.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [priorityFilter, rows, statusFilter]);
  const activeActionRow = rows.find((row) => row.id === activeActionId);
  const activeActionStatus = activeActionRow ? getStatusMeta(activeActionRow.status) : null;
  const activeStatusActions = activeActionRow ? getStatusActions(activeActionRow.status) : [];

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
                  <div className="row-action-menu">
                    <button
                      type="button"
                      className="row-action-trigger"
                      aria-label={`Aksi ${row.id}`}
                      aria-haspopup="dialog"
                      onClick={() => setActiveActionId(row.id)}
                    >
                      <DotsThreeVertical size={18} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {activeActionRow && activeActionStatus ? (
        <div className="row-action-popover-backdrop" role="presentation" onClick={() => setActiveActionId(null)}>
          <div
            className="row-action-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="row-action-popover-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="row-action-popover-header">
              <div>
                <p className="eyebrow">Aksi SPK</p>
                <h3 id="row-action-popover-title">{activeActionRow.id}</h3>
              </div>
              <button type="button" className="row-action-close" aria-label="Tutup aksi SPK" onClick={() => setActiveActionId(null)}>x</button>
            </div>
            <div className="row-action-popover-meta">
              <span>{activeActionRow.asset}</span>
              <span className="spk-status-pill" style={{ background: activeActionStatus.bg, color: activeActionStatus.color }}>{activeActionStatus.label}</span>
            </div>
            <div className="row-action-content">
              <button
                type="button"
                onClick={() => {
                  onSelect(activeActionRow.id);
                  setActiveActionId(null);
                }}
              >
                Lihat Detail
              </button>
              {activeStatusActions.length > 0 ? (
                <div className="row-action-group">
                  <span>Progress Status</span>
                  {activeStatusActions.map((action) => (
                    <button
                      key={action.nextStatus}
                      type="button"
                      onClick={() => {
                        onStatusChange(activeActionRow.id, action.nextStatus);
                        setActiveActionId(null);
                      }}
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
                    className={`priority-action priority-${priority.toLowerCase()}${activeActionRow.priority === priority ? " selected" : ""}`}
                    onClick={() => {
                      onPriorityChange(activeActionRow.id, priority);
                      setActiveActionId(null);
                    }}
                  >
                    {priorityLabel[priority]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="row-action-evidence"
                onClick={() => {
                  onSelect(activeActionRow.id);
                  setActiveActionId(null);
                }}
              >
                Lihat Evidence
              </button>
              <button
                type="button"
                className="row-action-note-button"
                onClick={() => {
                  onSelect(activeActionRow.id);
                  setActiveActionId(null);
                }}
              >
                Buat Catatan
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <div className="empty-state">Tidak ada SPK yang cocok dengan filter saat ini.</div>
      ) : null}

      <div className="spk-table-footer">
        {footerMessage ? <span>{footerMessage}</span> : null}
        <Button variant="ghost" className="table-mini-button" onClick={() => setFooterMessage("Export SPK disimulasikan di frontend.")}>Export</Button>
        <Button
          variant="secondary"
          className="table-mini-button"
          onClick={() => {
            setStatusFilter("all");
            setPriorityFilter("all");
            onSelect(rows[0]?.id ?? selectedId);
            setFooterMessage("Queue diperbarui dari state lokal.");
          }}
        >
          Refresh Queue
        </Button>
      </div>
    </Card>
  );
}

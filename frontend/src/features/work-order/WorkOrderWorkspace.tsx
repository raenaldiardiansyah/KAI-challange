"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WorkOrderForm } from "./WorkOrderForm";
import { getStatusMeta, type SpkRow, type SpkStatus, WorkOrderTable } from "./WorkOrderTable";
import type { Severity } from "@/types/common";
import type { WorkOrder } from "@/types/workOrder";

function mapWorkOrderStatus(status: WorkOrder["status"]): SpkStatus {
  switch (status) {
    case "In Progress": return "in-progress";
    case "Completed": return "completed";
    case "Draft":
    case "Requested":
    default: return "open";
  }
}

function buildSpkRows(workOrders: WorkOrder[]): SpkRow[] {
  const serviceRows: SpkRow[] = workOrders.map((workOrder, index) => ({
    id: workOrder.id.replace("WO", "SPK"),
    source: index === 0 ? "Alarm: Deviasi BC" : "Manual",
    eventCode: index === 0 ? "LOCAL_BC_DEVIATION" : "MANUAL_REQUEST",
    asset: `${workOrder.trainsetId} - C${workOrder.carNumber}`,
    trainsetId: workOrder.trainsetId,
    carNumber: workOrder.carNumber,
    subsystem: index === 0 ? "Brake System" : "General",
    task: workOrder.title,
    priority: workOrder.priority,
    status: mapWorkOrderStatus(workOrder.status),
    deadline: "2026-07-05",
    assignee: workOrder.assignee,
    evidence: index === 0
      ? ["Brake Pipe 4.2 bar normal", "Brake Cylinder 1.1 bar deviasi (Threshold 2.0)"]
      : ["Dibuat dari input manual"],
    recommendation: index === 0
      ? "Inspeksi brake cylinder valve dan cek potensi kebocoran lokal."
      : "Validasi kondisi aset sebelum penjadwalan.",
    notes: index === 0
      ? "Menunggu validasi teknisi depo sebelum diterbitkan ke lapangan."
      : "Draft awal perlu dilengkapi."
  }));

  return [
    ...serviceRows,
    {
      id: "SPK-2407-002",
      source: "Predictive: TTW 2 Hari",
      eventCode: "GENSET_FREQ_DRIFT",
      asset: "TS-002 - C2",
      trainsetId: "TS-002",
      carNumber: 2,
      subsystem: "Genset",
      task: "Validasi frekuensi genset dan cek governor",
      priority: "Medium",
      status: "in-progress",
      deadline: "2026-07-06",
      assignee: "Depo Bandung",
      evidence: ["Frekuensi 47.8 Hz", "RPM 1420", "Voltage 384 V"],
      recommendation: "Cek governor genset dan stabilitas suplai beban.",
      notes: "Teknisi sudah menerima assignment, inspeksi dijadwalkan shift malam."
    },
    {
      id: "SPK-2406-089",
      source: "Alarm: Suhu HVAC",
      eventCode: "HVAC_TEMP_HIGH",
      asset: "TS-003 - C1",
      trainsetId: "TS-003",
      carNumber: 1,
      subsystem: "HVAC",
      task: "Pembersihan filter AC dan cek sensor suhu",
      priority: "Low",
      status: "overdue",
      deadline: "2026-06-30",
      assignee: "Depo Manggarai",
      evidence: ["Suhu kabin 28.4 C", "Filter check tertunda", "Alarm berulang 3 kali"],
      recommendation: "Bersihkan filter HVAC dan kalibrasi sensor suhu.",
      notes: "Deadline terlewat, perlu eskalasi supervisor."
    },
    {
      id: "SPK-2407-004",
      source: "Maintenance Rutin",
      eventCode: "SCHEDULED_CHECK",
      asset: "TS-004 - C7",
      trainsetId: "TS-004",
      carNumber: 7,
      subsystem: "Door System",
      task: "Pemeriksaan mekanisme pintu dan controller",
      priority: "Medium",
      status: "completed",
      deadline: "2026-07-01",
      assignee: "Depo Jakarta",
      evidence: ["Cycle count normal", "Controller online", "Tidak ada alarm aktif"],
      recommendation: "Simpan catatan sebagai baseline inspeksi rutin.",
      notes: "Pekerjaan selesai dan sudah diverifikasi QC."
    }
  ];
}

function getTimeline(status: SpkStatus) {
  if (status === "completed") return ["Created", "Assigned", "In Progress", "Completed"];
  if (status === "in-progress") return ["Created", "Assigned", "In Progress"];
  if (status === "overdue") return ["Created", "Assigned", "Deadline Missed"];
  return ["Created", "Waiting Assignment"];
}

export function WorkOrderWorkspace({ workOrders }: { workOrders: WorkOrder[] }) {
  const initialRows = useMemo(() => buildSpkRows(workOrders), [workOrders]);
  const [rows, setRows] = useState(initialRows);
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  const summary = [
    { label: "SPK Terbuka", value: rows.filter((row) => row.status === "open").length, tone: "danger" },
    { label: "Sedang Dikerjakan", value: rows.filter((row) => row.status === "in-progress").length, tone: "warning" },
    { label: "Selesai", value: rows.filter((row) => row.status === "completed").length, tone: "success" },
    { label: "Overdue", value: rows.filter((row) => row.status === "overdue").length, tone: "dark" }
  ];

  const status = getStatusMeta(selected.status);
  const timeline = getTimeline(selected.status);

  const handlePriorityChange = (id: string, priority: Severity) => {
    setRows((currentRows) => currentRows.map((row) => row.id === id ? { ...row, priority } : row));
    setSelectedId(id);
  };

  const handleStatusChange = (id: string, status: SpkStatus) => {
    setRows((currentRows) => currentRows.map((row) => row.id === id ? { ...row, status } : row));
    setSelectedId(id);
  };

  return (
    <div className="page-grid spk-workflow-page">
      <header className="spk-page-header">
        <div>
          <p className="eyebrow">Surat Perintah Kerja</p>
          <h1>SPK Maintenance</h1>
          <p>Ringkasan tindak lanjut maintenance dari alarm, insight, dan predictive risk.</p>
        </div>
      </header>

      <section className="spk-summary-grid">
        {summary.map((item) => (
          <Card key={item.label}>
            <div className={`spk-summary-card tone-${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </Card>
        ))}
      </section>

      <section className="spk-workflow-layout">
        <aside className="workflow-form-panel">
          <WorkOrderForm />
        </aside>
        <section className="workflow-table-panel">
          <WorkOrderTable
            rows={rows}
            selectedId={selected.id}
            onSelect={setSelectedId}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
          />
        </section>
      </section>

      <section className="spk-detail-panel">
        <Card
          title="Detail SPK Terpilih"
          eyebrow={selected.id}
          action={<span className="spk-status-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>}
        >
          <div className="spk-detail-layout">
            <div className="spk-detail-grid">
              <div>
                <span>Sumber Indikasi</span>
                <strong>{selected.source}</strong>
                <small>{selected.eventCode}</small>
              </div>
              <div>
                <span>Armada & Gerbong</span>
                <strong>{selected.asset}</strong>
                <small>{selected.subsystem}</small>
              </div>
              <div>
                <span>Prioritas Operasional</span>
                <Badge label={selected.priority} severity={selected.priority} />
                <small>Bisa dioverride operator</small>
              </div>
              <div>
                <span>Status SPK</span>
                <strong>{status.label}</strong>
                <small>Progress dari proses operasional</small>
              </div>
              <div>
                <span>Deadline</span>
                <strong>{selected.deadline}</strong>
                <small>PIC: {selected.assignee}</small>
              </div>
            </div>

            <div className="spk-status-actions">
              {selected.status === "open" ? (
                <Button variant="secondary" onClick={() => handleStatusChange(selected.id, "in-progress")}>Mulai Dikerjakan</Button>
              ) : null}
              {selected.status === "in-progress" ? (
                <Button variant="primary" onClick={() => handleStatusChange(selected.id, "completed")}>Tandai Selesai</Button>
              ) : null}
              {selected.status === "overdue" ? (
                <>
                  <Button variant="secondary" onClick={() => handleStatusChange(selected.id, "in-progress")}>Lanjutkan Dikerjakan</Button>
                  <Button variant="primary" onClick={() => handleStatusChange(selected.id, "completed")}>Tandai Selesai</Button>
                </>
              ) : null}
              {selected.status === "completed" ? <span>SPK selesai. Status dikunci sebagai riwayat operasional.</span> : null}
            </div>

            <div className="spk-evidence-panel">
              <div>
                <span className="eyebrow">Tugas</span>
                <p>{selected.task}</p>
              </div>
              <div>
                <span className="eyebrow">Evidence Sensor</span>
                <ul>
                  {selected.evidence.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <span className="eyebrow">Ringkasan Bahasa Natural</span>
                <p>{selected.recommendation}</p>
              </div>
              <div>
                <span className="eyebrow">Catatan Tindakan</span>
                <p>{selected.notes}</p>
              </div>
            </div>

            <div className="spk-timeline" style={{ "--timeline-columns": timeline.length } as React.CSSProperties}>
              {timeline.map((item, index) => (
                <div key={item} className={index === timeline.length - 1 ? "timeline-step current" : "timeline-step"}>
                  <span>{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

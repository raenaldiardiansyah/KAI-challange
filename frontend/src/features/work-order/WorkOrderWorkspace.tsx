"use client";

import { useMemo, useState } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { technicianContacts, workOrderOperator } from "@/dummy/technicianDummy";
import type { EmailNotificationRecord } from "@/types/emailNotification";
import { WorkOrderForm, type WorkOrderDraft } from "./WorkOrderForm";
import { TechnicianEmailDialog } from "./TechnicianEmailDialog";
import { getStatusMeta, type SpkRow, type SpkStatus, WorkOrderTable } from "./WorkOrderTable";
import type { Severity } from "@/types/common";

function getTimeline(status: SpkStatus) {
  if (status === "completed") return ["Created", "Assigned", "In Progress", "Completed"];
  if (status === "in-progress") return ["Created", "Assigned", "In Progress"];
  if (status === "overdue") return ["Created", "Assigned", "Deadline Missed"];
  return ["Created", "Waiting Assignment"];
}

export function WorkOrderWorkspace({ workOrders }: { workOrders: SpkRow[] }) {
  const initialRows = useMemo(() => workOrders.map((row) => ({ ...row })), [workOrders]);
  const [rows, setRows] = useState(initialRows);
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const [isDraftSheetOpen, setIsDraftSheetOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailDialogKey, setEmailDialogKey] = useState(0);
  const [detailTab, setDetailTab] = useState<"summary" | "evidence" | "actions" | "history">("summary");
  const [emailHistory, setEmailHistory] = useState<EmailNotificationRecord[]>([]);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const selectedEmailHistory = emailHistory.filter((record) => record.workOrderId === selected.id);

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

  const handleSaveDraft = (draft: WorkOrderDraft) => {
    const nextId = `SPK-2407-${String(rows.length + 1).padStart(3, "0")}`;
    const newRow: SpkRow = {
      id: nextId,
      source: draft.source,
      eventCode: draft.eventCode,
      asset: `${draft.trainsetId} - C${draft.carNumber}`,
      trainsetId: draft.trainsetId,
      carNumber: draft.carNumber,
      subsystem: draft.subsystem,
      task: draft.task,
      priority: draft.priority,
      status: "open",
      deadline: draft.deadline,
      assignee: "Belum ditugaskan",
      evidence: ["Draft dibuat dari form SPK", `${draft.subsystem} perlu validasi teknis`],
      recommendation: "Validasi evidence lapangan lalu tetapkan PIC maintenance.",
      notes: "SPK baru tersimpan di local state frontend untuk simulasi."
    };

    setRows((currentRows) => [newRow, ...currentRows]);
    setSelectedId(nextId);
    setIsDraftSheetOpen(false);
  };

  const handleEmailSent = (record: EmailNotificationRecord) => {
    setEmailHistory((currentHistory) => [record, ...currentHistory]);
  };

  const handleOpenEmailDialog = () => {
    setEmailDialogKey((currentKey) => currentKey + 1);
    setIsEmailDialogOpen(true);
  };

  return (
    <div className="page-grid spk-workflow-page">
      <header className="spk-page-header">
        <div>
          <p className="eyebrow">Surat Perintah Kerja</p>
          <h1>SPK Maintenance</h1>
          <p>Ringkasan tindak lanjut maintenance dari alarm, insight, dan predictive risk.</p>
        </div>
        <Button onClick={() => setIsDraftSheetOpen(true)}>Buat Draft SPK</Button>
      </header>

      <section className="spk-summary-grid">
        {summary.map((item) => (
          <Card key={item.label} className={`summary-accent-card summary-tone-${item.tone}`}>
            <div className="spk-summary-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </Card>
        ))}
      </section>

      <section className="spk-main-workspace">
        <section className="workflow-table-panel">
          <WorkOrderTable
            rows={rows}
            selectedId={selected.id}
            onSelect={setSelectedId}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
          />
        </section>

        <aside className="spk-detail-panel">
          <Card
            title="Detail SPK Terpilih"
            eyebrow={selected.id}
            action={<span className="spk-status-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>}
          >
            <div className="spk-detail-layout">
              <div className="spk-inspector-head">
                <div>
                  <h3>{selected.task}</h3>
                  <p>{selected.asset} - {selected.subsystem}</p>
                </div>
                <Badge label={selected.priority} severity={selected.priority} />
              </div>

              <div className="spk-status-actions">
                <Button
                  variant="secondary"
                  icon={<EnvelopeSimple size={17} weight="bold" />}
                  onClick={handleOpenEmailDialog}
                >
                  Kirim ke Teknisi
                </Button>
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

              <div className="spk-detail-tabs" role="tablist" aria-label="Detail SPK">
                {[
                  { id: "summary", label: "Ringkasan" },
                  { id: "evidence", label: "Evidence" },
                  { id: "actions", label: "Tindakan" },
                  { id: "history", label: "Riwayat" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={detailTab === tab.id ? "active" : ""}
                    role="tab"
                    aria-selected={detailTab === tab.id}
                    onClick={() => setDetailTab(tab.id as typeof detailTab)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {detailTab === "summary" ? (
                <>
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
                      <small>Progress operasional</small>
                    </div>
                    <div>
                      <span>Deadline</span>
                      <strong>{selected.deadline}</strong>
                      <small>PIC: {selected.assignee}</small>
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
                </>
              ) : null}

              {detailTab === "evidence" ? (
                <div className="spk-evidence-panel">
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
              ) : null}

              {detailTab === "actions" ? (
                <div className="spk-notification-panel">
                  <div>
                    <span className="eyebrow">Notifikasi Teknisi</span>
                    <strong>Email assignment SPK</strong>
                    <p>Kirim ringkasan SPK, evidence, dan rekomendasi ke teknisi yang sesuai dengan subsistem.</p>
                  </div>
                  <div className="spk-notification-history">
                    <span>Gunakan tombol Kirim ke Teknisi untuk membuka assignment console.</span>
                  </div>
                </div>
              ) : null}

              {detailTab === "history" ? (
                <div className="spk-notification-panel">
                  <div>
                    <span className="eyebrow">Riwayat Penugasan</span>
                    <strong>Email dan progress SPK</strong>
                    <p>Riwayat hanya menampilkan event yang benar-benar terjadi di state frontend.</p>
                  </div>
                  <div className="spk-notification-history">
                    {selectedEmailHistory.length > 0 ? (
                      selectedEmailHistory.map((record) => (
                        <div key={record.id} className="spk-notification-record">
                          <span>{record.recipientName}</span>
                          <strong>{record.recipientEmail}</strong>
                          <small>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.sentAt))}</small>
                        </div>
                      ))
                    ) : (
                      <span>Belum ada email yang dikirim untuk SPK ini.</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </aside>
      </section>

      <Sheet
        open={isDraftSheetOpen}
        title="Buat Draft SPK Baru"
        description="Isi draft tanpa meninggalkan daftar SPK dan detail yang sedang dipilih."
        className="spk-draft-sheet"
        onClose={() => setIsDraftSheetOpen(false)}
      >
        <WorkOrderForm embedded onSave={handleSaveDraft} />
      </Sheet>

      <TechnicianEmailDialog
        key={`${selected.id}-${emailDialogKey}`}
        open={isEmailDialogOpen}
        row={selected}
        technicians={technicianContacts}
        operator={workOrderOperator}
        onClose={() => setIsEmailDialogOpen(false)}
        onSent={handleEmailSent}
      />
    </div>
  );
}

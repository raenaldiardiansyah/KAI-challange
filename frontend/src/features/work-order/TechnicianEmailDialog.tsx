"use client";

import { useMemo, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { getEmailNotificationConfigStatus, sendWorkOrderEmail } from "@/services/emailNotificationService";
import type { EmailNotificationRecord, TechnicianContact } from "@/types/emailNotification";
import type { SpkRow } from "./WorkOrderTable";

const operatorName = "Operator Control Center";
const operatorEmail = "raenaldi.ardiansyah30@gmail.com";

function getTechnicianMatches(row: SpkRow, technicians: TechnicianContact[]) {
  const subsystem = row.subsystem.toLowerCase();
  const matches = technicians.filter((technician) =>
    technician.specialization.some((item) => subsystem.includes(item.toLowerCase()) || item.toLowerCase().includes(subsystem))
  );

  return matches.length > 0 ? matches : technicians;
}

function buildDefaultMessage(row: SpkRow) {
  return [
    `Mohon tindak lanjuti ${row.id} untuk ${row.asset}.`,
    `Fokus pemeriksaan: ${row.subsystem}.`,
    `Prioritas ${row.priority}, deadline ${row.deadline}.`,
    row.recommendation
  ].join("\n");
}

export function TechnicianEmailDialog({
  open,
  row,
  technicians,
  copyRecipients,
  onClose,
  onSent
}: {
  open: boolean;
  row: SpkRow;
  technicians: TechnicianContact[];
  copyRecipients: TechnicianContact[];
  onClose: () => void;
  onSent: (record: EmailNotificationRecord) => void;
}) {
  const configStatus = getEmailNotificationConfigStatus();
  const matchingTechnicians = useMemo(() => getTechnicianMatches(row, technicians), [row, technicians]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(matchingTechnicians[0]?.id ?? "");
  const [message, setMessage] = useState(buildDefaultMessage(row));
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedTechnician = matchingTechnicians.find((technician) => technician.id === selectedTechnicianId) ?? matchingTechnicians[0];
  const recipients = useMemo(() => {
    const recipientMap = new Map<string, TechnicianContact>();
    if (selectedTechnician) recipientMap.set(selectedTechnician.email, selectedTechnician);
    copyRecipients.forEach((recipient) => recipientMap.set(recipient.email, recipient));
    return Array.from(recipientMap.values());
  }, [copyRecipients, selectedTechnician]);
  const canSend = Boolean(configStatus.isConfigured && recipients.length > 0 && message.trim() && sendState !== "sending");

  const handleSend = async () => {
    if (recipients.length === 0) return;

    setSendState("sending");
    setStatusMessage(`Mengirim email ke ${recipients.length} penerima...`);

    const results = await Promise.all(recipients.map(async (recipient) => {
      const result = await sendWorkOrderEmail({
        technicianName: recipient.name,
        technicianEmail: recipient.email,
        operatorName,
        operatorEmail,
        spkId: row.id,
        trainsetId: row.trainsetId,
        carNumber: row.carNumber,
        subsystem: row.subsystem,
        priority: row.priority,
        deadline: row.deadline,
        task: row.task,
        evidence: row.evidence,
        recommendation: row.recommendation,
        operatorMessage: message
      });

      return { recipient, result };
    }));

    const sentResults = results.filter(({ result }) => result.success);
    const failedResults = results.filter(({ result }) => !result.success);

    sentResults.forEach(({ recipient, result }) => {
      if (!result.success) return;
      onSent({
        id: `EMAIL-${recipient.id}-${Date.now()}`,
        workOrderId: row.id,
        type: "email",
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        sentBy: operatorName,
        sentAt: result.sentAt,
        status: "sent",
        message
      });
    });

    if (failedResults.length === 0) {
      setSendState("sent");
      setStatusMessage(`Email terkirim ke ${sentResults.length} penerima: ${sentResults.map(({ recipient }) => recipient.email).join(", ")}.`);
      return;
    }

    setSendState("failed");
    setStatusMessage(
      [
        sentResults.length > 0 ? `Berhasil: ${sentResults.map(({ recipient }) => recipient.email).join(", ")}.` : "",
        `Gagal: ${failedResults.map(({ recipient }) => recipient.email).join(", ")}.`,
        "Periksa konfigurasi EmailJS atau template tujuan email."
      ].filter(Boolean).join(" ")
    );
  };

  return (
    <Sheet
      open={open}
      title="Kirim SPK ke Teknisi"
      description={`${row.id} - ${row.asset} - ${row.subsystem}`}
      className="assignment-sheet"
      onClose={onClose}
    >
      <div className="technician-email-dialog">
        <div className={configStatus.isConfigured ? "email-status-banner configured" : "email-status-banner warning"}>
          <strong>{configStatus.isConfigured ? "EmailJS aktif" : "Konfigurasi EmailJS belum lengkap"}</strong>
          <span>
            Service: {configStatus.serviceId || "-"} · Template: {configStatus.templateId || "-"}
          </span>
        </div>

        <div className="technician-email-grid">
          <section className="technician-email-panel">
            <p className="eyebrow">Tujuan teknisi</p>
            <label className="field-stack">
              <span>Alias teknisi</span>
              <Select
                value={selectedTechnicianId}
                onChange={(event) => setSelectedTechnicianId(event.target.value)}
                aria-label="Pilih teknisi penerima SPK"
              >
                {matchingTechnicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>{technician.name}</option>
                ))}
              </Select>
            </label>
            {selectedTechnician ? (
              <div className="technician-contact-card">
                <strong>{selectedTechnician.email}</strong>
                <span>{selectedTechnician.specialization.join(", ")}</span>
                <small>Status: {selectedTechnician.status === "available" ? "tersedia" : selectedTechnician.status}</small>
              </div>
            ) : (
              <div className="technician-contact-card">Belum ada teknisi yang tersedia.</div>
            )}
            <div className="email-recipient-list">
              <span>Dikirim ke {recipients.length} penerima</span>
              {recipients.map((recipient) => (
                <strong key={recipient.email}>{recipient.name} - {recipient.email}</strong>
              ))}
            </div>
          </section>

          <section className="technician-email-panel">
            <p className="eyebrow">Ringkasan SPK</p>
            <div className="email-summary-list">
              <span><strong>{row.id}</strong>{row.asset}</span>
              <span><strong>Subsistem</strong>{row.subsystem}</span>
              <span><strong>Prioritas</strong>{row.priority}</span>
              <span><strong>Deadline</strong>{row.deadline}</span>
            </div>
          </section>
        </div>

        <label className="field-stack">
          <span>Pesan operator</span>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            aria-label="Pesan operator untuk teknisi"
          />
        </label>

        <section className="email-preview-panel">
          <p className="eyebrow">Preview isi email</p>
          <h3>{row.task}</h3>
          <p>{message}</p>
          <ul>
            {row.evidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {statusMessage ? (
          <div className={`email-send-result ${sendState}`}>
            {statusMessage}
          </div>
        ) : null}

        <div className="technician-email-actions">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button icon={<PaperPlaneTilt size={17} weight="bold" />} disabled={!canSend} onClick={handleSend}>
            {sendState === "sending" ? "Mengirim..." : "Kirim Email"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

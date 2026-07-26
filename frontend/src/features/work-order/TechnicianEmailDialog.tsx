"use client";

import { useEffect, useMemo, useState } from "react";
import { EnvelopeSimple, Info, MagnifyingGlass, PaperPlaneTilt, TelegramLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { getEmailNotificationConfigStatus, sendWorkOrderEmail } from "@/services/emailNotificationService";
import {
  getTelegramNotificationConfigStatus,
  sendWorkOrderTelegram,
  type TelegramConfigStatus
} from "@/services/telegramNotificationService";
import type { EmailNotificationRecord, OperatorContact, TechnicianContact } from "@/types/emailNotification";
import type { SpkRow } from "./WorkOrderTable";

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
  operator,
  onClose,
  onSent
}: {
  open: boolean;
  row: SpkRow;
  technicians: TechnicianContact[];
  operator: OperatorContact;
  onClose: () => void;
  onSent: (record: EmailNotificationRecord) => void;
}) {
  const configStatus = getEmailNotificationConfigStatus();
  const matchingTechnicians = useMemo(() => getTechnicianMatches(row, technicians), [row, technicians]);
  const [recipientMode, setRecipientMode] = useState<"all" | "specific">("all");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(matchingTechnicians[0]?.id ?? technicians[0]?.id ?? "");
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [message, setMessage] = useState(buildDefaultMessage(row));
  const [emailSendState, setEmailSendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [telegramSendState, setTelegramSendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [emailStatusMessage, setEmailStatusMessage] = useState("");
  const [telegramStatusMessage, setTelegramStatusMessage] = useState("");
  const [telegramConfigStatus, setTelegramConfigStatus] = useState<TelegramConfigStatus>({
    isConfigured: false,
    reason: "Memeriksa konfigurasi Telegram..."
  });

  useEffect(() => {
    if (!open) return;

    let active = true;
    void getTelegramNotificationConfigStatus(row.subsystem).then((status) => {
      if (active) setTelegramConfigStatus(status);
    });

    return () => {
      active = false;
    };
  }, [open, row.subsystem]);

  const visibleTechnicians = useMemo(() => {
    const query = technicianSearch.trim().toLowerCase();
    return technicians.filter((technician) =>
      !query ||
      technician.name.toLowerCase().includes(query) ||
      technician.email.toLowerCase().includes(query) ||
      technician.specialization.some((item) => item.toLowerCase().includes(query))
    );
  }, [technicianSearch, technicians]);
  const selectedTechnician = technicians.find((technician) => technician.id === selectedTechnicianId);
  const recipients = recipientMode === "all"
    ? technicians
    : selectedTechnician
      ? [selectedTechnician]
      : [];
  const canSendEmail = Boolean(
    configStatus.isConfigured &&
    recipients.length > 0 &&
    message.trim() &&
    emailSendState !== "sending"
  );
  const canSendTelegram = Boolean(
    telegramConfigStatus.isConfigured &&
    message.trim() &&
    telegramSendState !== "sending"
  );

  const handleSendEmail = async () => {
    if (recipients.length === 0) return;

    setEmailSendState("sending");
    setEmailStatusMessage(`Mengirim email ke ${recipients.length} penerima...`);

    const results = await Promise.all(recipients.map(async (recipient) => {
      const result = await sendWorkOrderEmail({
        technicianName: recipient.name,
        technicianEmail: recipient.email,
        operatorName: operator.name,
        operatorEmail: operator.email,
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
        sentBy: operator.name,
        sentAt: result.sentAt,
        status: "sent",
        message
      });
    });

    if (failedResults.length === 0) {
      setEmailSendState("sent");
      setEmailStatusMessage(`Email terkirim ke ${sentResults.length} penerima.`);
      return;
    }

    setEmailSendState("failed");
    const failureReasons = [...new Set(
      failedResults
        .map(({ result }) => result.success ? "" : result.message)
        .filter(Boolean)
    )];
    setEmailStatusMessage(
      [
        sentResults.length > 0 ? `Berhasil: ${sentResults.map(({ recipient }) => recipient.email).join(", ")}.` : "",
        failedResults.length > 0 ? `Email gagal: ${failedResults.map(({ recipient }) => recipient.email).join(", ")}.` : "",
        failureReasons.length > 0 ? `Alasan: ${failureReasons.join(" | ")}` : "Periksa konfigurasi EmailJS atau template tujuan email."
      ].filter(Boolean).join(" ")
    );
  };

  const handleSendTelegram = async () => {
    setTelegramSendState("sending");
    setTelegramStatusMessage("Mengirim notifikasi Telegram...");

    const result = await sendWorkOrderTelegram({
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

    if (result.success) {
      setTelegramSendState("sent");
      setTelegramStatusMessage(`Telegram terkirim ke ${result.sent ?? 0} chat.`);
      return;
    }

    setTelegramSendState("failed");
    setTelegramStatusMessage(
      `Telegram gagal: ${result.message ?? "periksa konfigurasi bot dan chat ID"}.`
    );
  };

  const handleSendBoth = async () => {
    await Promise.all([handleSendEmail(), handleSendTelegram()]);
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
        <div className="notification-config-grid">
          <div className={configStatus.isConfigured ? "email-status-banner configured" : "email-status-banner warning"}>
            {configStatus.isConfigured
              ? <EnvelopeSimple size={22} weight="fill" aria-hidden="true" />
              : <Info size={22} weight="fill" aria-hidden="true" />}
            <div>
              <strong>{configStatus.isConfigured ? "EmailJS aktif" : "EmailJS tidak aktif"}</strong>
              <span>{configStatus.reason}</span>
            </div>
          </div>

          <div className={telegramConfigStatus.isConfigured ? "email-status-banner configured" : "email-status-banner warning"}>
            {telegramConfigStatus.isConfigured
              ? <TelegramLogo size={22} weight="fill" aria-hidden="true" />
              : <Info size={22} weight="fill" aria-hidden="true" />}
            <div>
              <strong>{telegramConfigStatus.isConfigured ? "Telegram aktif" : "Telegram tidak aktif"}</strong>
              <span>{telegramConfigStatus.reason}</span>
            </div>
          </div>
        </div>

        <div className="technician-toolbar">
          <label className="field-stack technician-search-field">
            <span>Cari teknisi berdasarkan nama, email, atau spesialisasi</span>
            <div className="technician-search-control">
              <MagnifyingGlass size={18} aria-hidden="true" />
              <Input
                value={technicianSearch}
                onChange={(event) => setTechnicianSearch(event.target.value)}
                placeholder={`Rekomendasi untuk ${row.subsystem}`}
                aria-label="Cari teknisi penerima SPK"
              />
            </div>
          </label>

          <div className="technician-delivery-filter">
            <label className="field-stack">
              <span>Kirim email kepada</span>
              <Select
                value={recipientMode}
                onChange={(event) => setRecipientMode(event.target.value as "all" | "specific")}
                aria-label="Filter penerima email"
              >
                <option value="all">Semua teknisi</option>
                <option value="specific">Teknisi tertentu</option>
              </Select>
            </label>

            {recipientMode === "specific" ? (
              <label className="field-stack">
                <span>Pilih teknisi tertentu</span>
                <Select
                  value={selectedTechnicianId}
                  onChange={(event) => setSelectedTechnicianId(event.target.value)}
                  aria-label="Pilih teknisi tertentu"
                >
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name} - {technician.email}
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}
          </div>
        </div>

        <section className="technician-email-panel technician-assignment-panel">
          <div>
            <div className="technician-recipient-heading">
              <p className="eyebrow">Penerima email ({recipients.length} teknisi)</p>
              <span>
                {recipientMode === "all"
                  ? "Satu kali kirim akan mengirim email ke semua teknisi."
                  : `Email hanya dikirim kepada ${selectedTechnician?.name ?? "teknisi yang dipilih"}.`}
              </span>
            </div>
            <div className="technician-search-menu">
              {visibleTechnicians.length > 0 ? visibleTechnicians.map((technician) => (
                <div key={technician.id} className={matchingTechnicians.some((item) => item.id === technician.id) ? "recommended" : ""}>
                  <strong>{technician.name}</strong>
                  <span>{technician.email}</span>
                  <small>{technician.specialization.join(", ")}</small>
                  {matchingTechnicians.some((item) => item.id === technician.id)
                    ? <em>Direkomendasikan untuk {row.subsystem}</em>
                    : null}
                </div>
              )) : <span>Tidak ada teknisi yang cocok.</span>}
            </div>
          </div>

          <div>
            <p className="eyebrow">Ringkasan SPK</p>
            <div className="email-summary-list">
              <span><strong>{row.id}</strong>{row.asset}</span>
              <span><strong>Subsistem</strong>{row.subsystem}</span>
              <span><strong>Prioritas</strong>{row.priority}</span>
              <span><strong>Deadline</strong>{row.deadline}</span>
              <span>
                <strong>Dikirim oleh</strong>
                <span className="email-summary-value">{operator.name}<small>{operator.email}</small></span>
              </span>
            </div>
          </div>
        </section>

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
          <p className="eyebrow">Preview isi email dan Telegram</p>
          <h3>{row.task}</h3>
          <p>{message}</p>
          <ul>
            {row.evidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {emailStatusMessage ? (
          <div className={`email-send-result ${emailSendState}`}>
            {emailStatusMessage}
          </div>
        ) : null}

        {telegramStatusMessage ? (
          <div className={`email-send-result ${telegramSendState}`}>
            {telegramStatusMessage}
          </div>
        ) : null}

        <div className="technician-email-actions">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button
            icon={<PaperPlaneTilt size={17} weight="bold" />}
            disabled={!canSendEmail || !canSendTelegram}
            onClick={handleSendBoth}
          >
            {emailSendState === "sending" || telegramSendState === "sending"
              ? "Mengirim Email & Telegram..."
              : "Kirim Email & Telegram"}
          </Button>
          </div>
        </div>
    </Sheet>
  );
}

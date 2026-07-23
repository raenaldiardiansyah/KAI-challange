"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Severity } from "@/types/common";

const priorityOptions = [
  { value: "critical", label: "Critical", description: "Stop operasi bila perlu" },
  { value: "high", label: "High", description: "Tindak lanjut segera" },
  { value: "medium", label: "Medium", description: "Masuk antrean inspeksi" }
];

export type WorkOrderDraft = {
  source: string;
  trainsetId: string;
  carNumber: number;
  subsystem: string;
  eventCode: string;
  priority: Severity;
  deadline: string;
  task: string;
};

const defaultDraft: WorkOrderDraft = {
  source: "Alarm: Anomali Brake Cylinder C5",
  trainsetId: "TS-001",
  carNumber: 5,
  subsystem: "Brake System",
  eventCode: "LOCAL_BC_DEVIATION",
  priority: "High",
  deadline: "2026-07-05",
  task: "Cek kebocoran pada katup Brake Cylinder Car 5"
};

export function WorkOrderForm({ onSave, embedded = false }: { onSave: (draft: WorkOrderDraft) => void; embedded?: boolean }) {
  const [draft, setDraft] = useState(defaultDraft);

  const updateDraft = <K extends keyof WorkOrderDraft>(key: K, value: WorkOrderDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setDraft(defaultDraft);
  };

  const handleSave = () => {
    onSave(draft);
    setDraft(defaultDraft);
  };

  const content = (
    <>
      <div className="spk-form-context">
        <div>
          <span>Evidence Mesin</span>
          <strong>LOCAL_BC_DEVIATION</strong>
        </div>
        <div className="sensor-grid">
          <span>Brake Pipe 4.2 bar normal</span>
          <span>Brake Cylinder 1.1 bar anomali (Threshold: 2.0 bar)</span>
          <span>Deviasi 1.2 bar</span>
        </div>
        <p>Ringkasan bahasa natural: tekanan brake cylinder rendah sementara brake pipe stabil, sehingga perlu inspeksi area brake cylinder dan valve.</p>
      </div>

      <div className="form-grid spk-form-grid">
        <label className="field-control">
          <span>Pilih Sumber Indikasi</span>
          <Select value={draft.source} onChange={(event) => updateDraft("source", event.target.value)}>
            <option value="none">-- Tanpa Referensi --</option>
            <option value="Alarm: Anomali Brake Cylinder C5">Alarm: Anomali Brake Cylinder C5</option>
            <option value="Insight: Deviasi tekanan 52%">Insight: Deviasi tekanan 52%</option>
            <option value="Predictive: TTW 2 Hari">Predictive: TTW 2 Hari</option>
          </Select>
        </label>
        
        <div className="spk-two-column-fields">
          <label className="field-control">
            <span>Armada</span>
            <Select value={draft.trainsetId} onChange={(event) => updateDraft("trainsetId", event.target.value)}>
              <option value="TS-001">Anggrek Lembah M02406</option>
              <option value="TS-002">Argo Wilis M02408</option>
              <option value="TS-003">Argo Parahyangan M02412</option>
            </Select>
          </label>
          <label className="field-control">
            <span>Gerbong</span>
            <Select value={`C${draft.carNumber}`} onChange={(event) => updateDraft("carNumber", Number(event.target.value.replace("C", "")))}>
              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={`C${index + 1}`}>C{index + 1}</option>
              ))}
            </Select>
          </label>
        </div>

        <div className="spk-two-column-fields">
          <label className="field-control">
            <span>Subsystem</span>
            <Select value={draft.subsystem} onChange={(event) => updateDraft("subsystem", event.target.value)}>
              <option value="Brake System">Brake System</option>
              <option value="Genset">Genset</option>
              <option value="HVAC">HVAC</option>
              <option value="Door System">Door System</option>
            </Select>
          </label>
          <label className="field-control">
            <span>Event Code</span>
            <Input type="text" value={draft.eventCode} onChange={(event) => updateDraft("eventCode", event.target.value)} />
          </label>
        </div>

        <div className="field-control">
          <span>Prioritas Operasional</span>
          <div className="priority-choice-group">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={option.label === draft.priority ? "priority-choice active" : "priority-choice"}
                aria-pressed={option.label === draft.priority}
                onClick={() => updateDraft("priority", option.label as Severity)}
              >
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <label className="field-control">
          <span>Batas Waktu (Deadline)</span>
          <Input type="date" value={draft.deadline} onChange={(event) => updateDraft("deadline", event.target.value)} />
        </label>

        <div className="spk-description-actions">
          <label className="field-control">
            <span>Deskripsi Tugas</span>
            <Textarea
              rows={5}
              value={draft.task}
              onChange={(event) => updateDraft("task", event.target.value)}
            />
          </label>

          <div className="spk-form-actions">
            <Button variant="secondary" onClick={handleReset}>Reset</Button>
            <Button variant="primary" onClick={handleSave}>Simpan SPK</Button>
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className="spk-form-embedded">{content}</div>;
  }

  return (
    <Card title="Buat Draft SPK Baru" eyebrow="Form Tindakan SPK">
      {content}
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const priorityOptions = [
  { value: "critical", label: "Critical", description: "Stop operasi bila perlu" },
  { value: "high", label: "High", description: "Tindak lanjut segera" },
  { value: "medium", label: "Medium", description: "Masuk antrean inspeksi" }
];

export function WorkOrderForm() {
  const [selectedPriority, setSelectedPriority] = useState("high");

  return (
    <Card title="Buat Draft SPK Baru" eyebrow="Form Tindakan SPK">
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
          <Select defaultValue="alarm5">
            <option value="none">-- Tanpa Referensi --</option>
            <option value="alarm5">Alarm: Anomali Brake Cylinder C5</option>
            <option value="insight1">Insight: Deviasi tekanan 52%</option>
            <option value="pm">Predictive: TTW 2 Hari</option>
          </Select>
        </label>
        
        <div className="spk-two-column-fields">
          <label className="field-control">
            <span>Armada</span>
            <Select defaultValue="ts001">
              <option value="ts001">Anggrek Lembah M02406</option>
              <option value="ts002">Argo Wilis M02408</option>
              <option value="ts003">Argo Parahyangan M02412</option>
            </Select>
          </label>
          <label className="field-control">
            <span>Gerbong</span>
            <Select defaultValue="c5">
              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={`c${index + 1}`}>C{index + 1}</option>
              ))}
            </Select>
          </label>
        </div>

        <div className="spk-two-column-fields">
          <label className="field-control">
            <span>Subsystem</span>
            <Select defaultValue="brake">
              <option value="brake">Brake System</option>
              <option value="genset">Genset</option>
              <option value="hvac">HVAC</option>
              <option value="door">Door System</option>
            </Select>
          </label>
          <label className="field-control">
            <span>Event Code</span>
            <Input type="text" defaultValue="LOCAL_BC_DEVIATION" />
          </label>
        </div>

        <div className="field-control">
          <span>Prioritas Operasional</span>
          <div className="priority-choice-group">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={option.value === selectedPriority ? "priority-choice active" : "priority-choice"}
                aria-pressed={option.value === selectedPriority}
                onClick={() => setSelectedPriority(option.value)}
              >
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <label className="field-control">
          <span>Batas Waktu (Deadline)</span>
          <Input type="date" defaultValue="2026-07-05" />
        </label>

        <div className="spk-description-actions">
          <label className="field-control">
            <span>Deskripsi Tugas</span>
            <Textarea
              rows={5}
              defaultValue="Cek kebocoran pada katup Brake Cylinder Car 5"
            />
          </label>

          <div className="spk-form-actions">
            <Button variant="secondary">Reset</Button>
            <Button variant="primary">Simpan SPK</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

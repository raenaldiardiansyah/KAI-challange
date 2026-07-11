"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

const validationOptions = [
  "Insight sesuai",
  "Perlu koreksi",
  "False positive",
];

export function OperatorValidationPanel() {
  const [validation, setValidation] = useState("Insight sesuai");
  const [note, setNote] = useState("Perlu inspeksi fisik pada brake cylinder C5 sebelum perjalanan berikutnya.");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const validationTime = useMemo(() => "11 Juli 2026, 10:22", []);

  return (
    <Card title="Validasi Operator" eyebrow="Feedback loop insight">
      <div className="insight-validation-panel">
        <div className="insight-validation-actions">
          {validationOptions.map((option) => (
            <Button
              key={option}
              variant={validation === option ? "primary" : "secondary"}
              onClick={() => setValidation(option)}
            >
              {option}
            </Button>
          ))}
          <Button variant="secondary" onClick={() => setIsNoteOpen((current) => !current)}>
            {isNoteOpen ? "Sembunyikan Catatan" : "Tambahkan Catatan"}
          </Button>
        </div>

        {isNoteOpen ? (
          <Textarea
            aria-label="Catatan validasi operator"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tambahkan catatan teknisi"
          />
        ) : null}

        <div className="insight-validation-status">
          <div>
            <span>Status validasi</span>
            <strong>{validation}</strong>
          </div>
          <div>
            <span>Divalidasi oleh</span>
            <strong>Operator Depo 1</strong>
          </div>
          <div>
            <span>Waktu validasi</span>
            <strong>{validationTime}</strong>
          </div>
          <div>
            <span>Catatan teknisi</span>
            <strong>{note || "Belum ada catatan"}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}

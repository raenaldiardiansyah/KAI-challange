"use client";

import { useState } from "react";
import { Info } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

const rootCauseCandidates = [
  {
    title: "Kebocoran lokal pada jalur brake cylinder",
    likelihood: "Kemungkinan tinggi",
    tone: "high",
    reason: "Tekanan Brake Cylinder turun jauh sementara Brake Pipe tetap stabil, sehingga masalah lebih cocok dibaca sebagai gangguan lokal.",
  },
  {
    title: "Respons control valve terlambat",
    likelihood: "Kemungkinan sedang",
    tone: "medium",
    reason: "Deviasi muncul saat siklus pengereman penuh, sehingga delay aktuasi valve masih perlu diuji pada inspeksi.",
  },
  {
    title: "Sambungan selang kurang rapat",
    likelihood: "Kemungkinan sedang",
    tone: "medium",
    reason: "Pola tekanan rendah bisa muncul bila sambungan pneumatik lokal tidak menahan tekanan secara konsisten.",
  },
  {
    title: "Kesalahan kalibrasi sensor",
    likelihood: "Kemungkinan rendah",
    tone: "low",
    reason: "Masih mungkin terjadi, tetapi pola pembanding dari Brake Pipe dan durasi anomali membuatnya bukan kandidat utama.",
  },
];

export function RootCauseCandidates() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedCandidate = selectedIndex === null ? null : rootCauseCandidates[selectedIndex];

  return (
    <Card title="Kemungkinan Akar Masalah" eyebrow="Kandidat penyebab">
      <div className="insight-root-cause-list">
        {rootCauseCandidates.map((candidate, index) => {
          return (
            <button
              className="insight-root-cause-item"
              key={candidate.title}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <span className="insight-root-cause-head">
                <span>
                  <strong>{index + 1}. {candidate.title}</strong>
                  <small className={`insight-likelihood ${candidate.tone}`}>{candidate.likelihood}</small>
                </span>
                <Info size={16} weight="bold" />
              </span>
            </button>
          );
        })}
      </div>
      <Modal
        open={selectedCandidate !== null}
        title={selectedCandidate?.title ?? "Detail akar masalah"}
        onClose={() => setSelectedIndex(null)}
      >
        {selectedCandidate ? (
          <div className="insight-modal-body">
            <span>{selectedCandidate.likelihood}</span>
            <strong>{selectedCandidate.title}</strong>
            <p>{selectedCandidate.reason}</p>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}

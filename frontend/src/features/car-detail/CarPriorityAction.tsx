"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CarDetail } from "@/types/car";
import { useRouter } from "next/navigation";

type CarPriorityActionProps = {
  car: CarDetail;
  onViewSensor?: () => void;
};

export function CarPriorityAction({ car, onViewSensor }: CarPriorityActionProps) {
  const router = useRouter();
  const carCode = car.backendCarId ?? car.id;
  const mainSubsystem = [...car.subsystems].sort((a, b) => a.healthScore - b.healthScore)[0];
  const subsystemName = mainSubsystem?.subsystem ?? "Brake System";
  const [processed, setProcessed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const workOrderUrl = `/work-order?trainset=${encodeURIComponent(car.trainsetId)}&car=${encodeURIComponent(carCode)}&subsystem=${encodeURIComponent(subsystemName)}`;

  const checklist = [
    `Periksa ${subsystemName} pada ${carCode}`,
    "Bandingkan tekanan dengan gerbong referensi",
    "Inspeksi selang, sambungan, valve, dan kebocoran lokal",
    "Validasi pembacaan sensor setelah pemeriksaan"
  ];

  return (
    <div className="car-action-tab">
      <Card title="Tindakan Prioritas" eyebrow="Rekomendasi utama" className={processed ? "car-action-status-card processed" : "car-action-status-card"}>
        <div className="car-action-status-grid">
          <span>
            <small>Prioritas</small>
            <strong>{car.healthScore < 60 ? "Tinggi" : "Sedang"}</strong>
          </span>
          <span>
            <small>Komponen</small>
            <strong>{subsystemName}</strong>
          </span>
          <span>
            <small>Estimasi</small>
            <strong>Sebelum perjalanan berikutnya</strong>
          </span>
          <span>
            <small>Status</small>
            <strong>{processed ? "Diproses" : "Menunggu tindakan"}</strong>
          </span>
        </div>

        <div className="recommendation car-action-recommendation">
          <strong>Perlu inspeksi terarah</strong>
          <p>
            Fokuskan pemeriksaan pada {subsystemName} unit {carCode}. Data kesehatan menunjukkan skor {car.healthScore}% dan perlu validasi sensor sebelum operasi berikutnya.
          </p>
        </div>

        <div className="action-row">
          <Button variant="primary" onClick={() => router.push(workOrderUrl)}>Buat SPK</Button>
          <Button variant="secondary" onClick={() => setProcessed(true)}>Tandai Diproses</Button>
          <Button variant="secondary" onClick={() => setShowNotes((current) => !current)}>Tambahkan Catatan</Button>
          <Button variant="secondary" onClick={onViewSensor}>Validasi Sensor</Button>
        </div>

        {showNotes ? (
          <textarea
            className="textarea-control car-technician-note"
            placeholder="Catatan teknisi, hasil inspeksi awal, atau instruksi tambahan..."
          />
        ) : null}
      </Card>

      <div className="car-action-followup-split">
        <Card title="Checklist Pemeriksaan" eyebrow="Instruksi teknisi">
          <div className="car-action-checklist-large">
            {checklist.map((item) => (
              <label key={item}>
                <input
                  checked={Boolean(checkedItems[item])}
                  onChange={(event) => setCheckedItems((current) => ({ ...current, [item]: event.target.checked }))}
                  type="checkbox"
                />
                <span>
                  <strong>{item}</strong>
                  <small>Klik checklist untuk menandai progres pemeriksaan.</small>
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Card title="Progres SPK" eyebrow="Status tindak lanjut">
          <div className="car-workorder-progress">
            <span className="active">Rekomendasi dibuat</span>
            <span className={processed ? "active" : ""}>Diproses teknisi</span>
            <span>SPK diterbitkan</span>
            <span>Validasi sensor</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

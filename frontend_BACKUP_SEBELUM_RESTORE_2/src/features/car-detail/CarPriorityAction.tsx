"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function CarPriorityAction({ onViewEvidence }: { onViewEvidence?: () => void }) {
  const router = useRouter();
  return (
    <Card title="Tindakan Prioritas" eyebrow="Rekomendasi Utama">
      <div className="stack">
        <div className="recommendation">
          <strong>Perlu Inspeksi Segera</strong>
          <p>Lakukan inspeksi pada brake cylinder, valve, dan cari potensi kebocoran lokal pada Gerbong 5. Bukti data menunjukkan deviasi ekstrem dibandingkan median armada.</p>
        </div>
        <div className="action-row">
          <Button variant="primary" onClick={() => router.push("/work-order")}>Buat SPK</Button>
          <Button variant="secondary" onClick={() => {
            if (onViewEvidence) onViewEvidence();
            else alert("Bukti sensor ada di panel bawah atau tab Evidence Sensor.");
          }}>Lihat Evidence Sensor</Button>
        </div>
      </div>
    </Card>
  );
}

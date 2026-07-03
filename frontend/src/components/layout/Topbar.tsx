"use client";

import { Broadcast } from "@phosphor-icons/react";
import { NotificationAlertButton } from "@/components/layout/NotificationAlertButton";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Sistem Pemantauan Aset Kereta RAMS</p>
        <h1>Dasbor Insight Operasional</h1>
      </div>
      <div className="topbar-actions">
        <Button variant="secondary" icon={<Broadcast size={16} />} onClick={() => alert("Menghubungkan ke API... (Simulasi)")}>Test Koneksi</Button>
        <NotificationAlertButton />
      </div>
    </header>
  );
}

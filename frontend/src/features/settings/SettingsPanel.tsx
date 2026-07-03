"use client";

import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export function SettingsPanel() {
  return (
    <Card title="Pengaturan Sistem" eyebrow="Preferensi & Integrasi">
      <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        <div className="stack" style={{ gap: "16px" }}>
          <h3 style={{ fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", margin: 0 }}>Preferensi Antarmuka (UI)</h3>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Mode Tampilan</label>
            <Select defaultValue="light">
              <option value="light">Terang (Light Mode)</option>
              <option value="dark">Gelap (Dark Mode)</option>
              <option value="auto">Ikuti Sistem</option>
            </Select>
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Tingkat Detail Map</label>
            <Select defaultValue="simple">
              <option value="simple">Sederhana (Rekomendasi)</option>
              <option value="detailed">Detail Lengkap</option>
            </Select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Refresh Interval (Auto-sync)</label>
            <Select defaultValue="30s">
              <option value="5s">5 Detik</option>
              <option value="15s">15 Detik</option>
              <option value="30s">30 Detik</option>
              <option value="1m">1 Menit</option>
              <option value="manual">Manual Refresh</option>
            </Select>
          </div>
        </div>

        <div className="stack" style={{ gap: "16px" }}>
          <h3 style={{ fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", margin: 0 }}>Koneksi Backend & Notifikasi</h3>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Sumber Data (Data Source)</label>
            <Select defaultValue="dummy">
              <option value="dummy">Dummy / Mock Mode (Presentasi)</option>
              <option value="api">Live API Mode (Belum tersambung ke backend produksi)</option>
            </Select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Status Koneksi MQTT/API</label>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
              Simulasi Connected WebSocket
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#64748b" }}>Email Notifikasi Alarm Kritis</label>
            <Input type="email" defaultValue="admin.depo@kai.id" />
          </div>
        </div>

      </div>
    </Card>
  );
}

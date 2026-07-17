"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Broadcast } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

type ConnectionStatus = "idle" | "testing" | "connected" | "partial" | "failed";

export function Topbar() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);

  useEffect(() => {
    if (connectionStatus !== "testing") return;

    const timer = window.setTimeout(() => {
      setConnectionStatus("partial");
      setShowConnectionPanel(true);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [connectionStatus]);

  const connectionLabel = useMemo(() => {
    switch (connectionStatus) {
      case "testing":
        return "Menguji...";
      case "connected":
        return "Terhubung";
      case "partial":
        return "Sebagian terganggu";
      case "failed":
        return "Gagal";
      default:
        return "Test Koneksi";
    }
  }, [connectionStatus]);

  const handleConnectionTest = () => {
    setConnectionStatus("testing");
    setShowConnectionPanel(true);
  };

  return (
    <header className="topbar">
      <Link className="topbar-title-link" href="/overview">
        <p className="eyebrow">Sistem Pemantauan Aset Kereta RAMS</p>
        <h1>Dasbor Insight Operasional</h1>
      </Link>
      <div className="topbar-actions">
        <div className="connection-test-wrap">
          <Button
            aria-expanded={showConnectionPanel}
            className={`connection-test-button ${connectionStatus}`}
            icon={<Broadcast size={16} />}
            onClick={handleConnectionTest}
            variant="secondary"
          >
            {connectionLabel}
          </Button>
          {showConnectionPanel ? (
            <div className="connection-popover" role="status">
              <div className="connection-popover-head">
                <strong>Status Koneksi</strong>
                <button aria-label="Tutup status koneksi" onClick={() => setShowConnectionPanel(false)} type="button">
                  Tutup
                </button>
              </div>
              <div className="connection-check-list">
                <span><b>API</b><em className="ok">Terhubung</em></span>
                <span><b>MQTT</b><em className={connectionStatus === "partial" ? "warn" : "ok"}>{connectionStatus === "partial" ? "Laten" : "Terhubung"}</em></span>
                <span><b>GPS</b><em className="ok">Terhubung</em></span>
                <span><b>Telemetry</b><em className={connectionStatus === "partial" ? "warn" : "ok"}>{connectionStatus === "partial" ? "2 data terlambat" : "Normal"}</em></span>
              </div>
              <small>Respons terakhir: 220 ms - simulasi lokal</small>
            </div>
          ) : null}
        </div>
        <Link className="button button-ghost topbar-alarm-link" href="/alarm-center" aria-label="Buka pusat alarm">
          <Bell size={18} />
        </Link>
      </div>
    </header>
  );
}

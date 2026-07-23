"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Broadcast } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { UserSessionControl } from "@/features/auth/UserSessionControl";
import { useDataMode } from "@/features/data-mode/DataModeProvider";
import { getSystemStatus, type SystemStatusData } from "@/services/systemService";

type ConnectionStatus = "idle" | "testing" | "connected" | "partial" | "failed";

export function Topbar() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);
  const [systemDetails, setSystemDetails] = useState<SystemStatusData | null>(null);
  const { mode, ready, changeMode, resourceStatus } = useDataMode();
  const nextMode = mode === "dummy" ? "live" : "dummy";
  const dataModeState = mode === "dummy"
    ? "dummy"
    : resourceStatus.error
      ? "error"
      : resourceStatus.stale || resourceStatus.fromCache
        ? "stale"
        : resourceStatus.source === "live"
          ? "connected"
          : "pending";
  const dataModeLabel = mode === "dummy"
    ? "DUMMY"
    : resourceStatus.error
      ? "LIVE ERROR"
      : resourceStatus.stale
        ? `STALE ${resourceStatus.fetchedAt ? new Date(resourceStatus.fetchedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}`
        : "LIVE";

  useEffect(() => {
    if (connectionStatus !== "testing" || mode === "live") return;

    const timer = window.setTimeout(() => {
      setConnectionStatus("partial");
      setShowConnectionPanel(true);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [connectionStatus, mode]);

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
    if (mode === "live") {
      void getSystemStatus().then((result) => {
        setSystemDetails(result.data);
        setConnectionStatus(result.data.apiOk && result.data.databaseOk && result.data.mqttConnected ? "connected" : "partial");
      }).catch(() => {
        setSystemDetails(null);
        setConnectionStatus("failed");
      });
    }
  };

  return (
    <header className="topbar">
      <Link className="topbar-title-link" href="/overview">
        <p className="eyebrow">Sistem Pemantauan Aset Kereta RAMS</p>
        <h1>Dasbor Insight Operasional</h1>
      </Link>
      <div className="topbar-actions">
        <button
          aria-label={`Sumber data ${mode === "dummy" ? "Dummy" : "API"}. Klik untuk beralih ke mode ${nextMode === "dummy" ? "Dummy" : "API"}.`}
          aria-pressed={mode === "live"}
          className={`data-mode-toggle ${dataModeState}`}
          disabled={!ready}
          onClick={() => changeMode(nextMode)}
          title={`Beralih ke Mode ${nextMode === "dummy" ? "Dummy" : "API"}`}
          type="button"
        >
          {dataModeLabel}
        </button>
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
                <span><b>API</b><em className={systemDetails?.apiOk === false ? "warn" : "ok"}>{mode === "live" ? systemDetails?.apiOk ? "Terhubung" : "Tidak tersedia" : "Simulasi"}</em></span>
                <span><b>MQTT</b><em className={systemDetails?.mqttConnected === false || connectionStatus === "partial" ? "warn" : "ok"}>{mode === "live" ? systemDetails?.mqttConnected ? "Terhubung" : "Offline" : "Simulasi"}</em></span>
                <span><b>Database</b><em className={systemDetails?.databaseOk === false ? "warn" : "ok"}>{mode === "live" ? systemDetails?.databaseOk ? "Terhubung" : "Tidak tersedia" : "Simulasi"}</em></span>
                <span><b>Queue</b><em className={systemDetails && systemDetails.queueSize > 0 ? "warn" : "ok"}>{mode === "live" ? systemDetails?.queueSize ?? "-" : "Simulasi"}</em></span>
              </div>
              <small>{mode === "live" ? `Pesan ${systemDetails?.messagesProcessed ?? 0}/${systemDetails?.messagesReceived ?? 0}${systemDetails?.lastError ? ` · ${systemDetails.lastError}` : ""}` : "Simulasi lokal — tidak memanggil RAMS"}</small>
            </div>
          ) : null}
        </div>
        <Link className="button button-ghost topbar-alarm-link" href="/alarm-center" aria-label="Buka pusat alarm">
          <Bell size={18} />
        </Link>
        <UserSessionControl showModeSwitch={false} />
      </div>
    </header>
  );
}

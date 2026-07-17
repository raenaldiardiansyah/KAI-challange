"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function ExportReportButton() {
  const [status, setStatus] = useState("");

  return (
    <div className="inline-action-status">
      <Button icon={<DownloadSimple size={16} />} onClick={() => setStatus("Export laporan menunggu integrasi backend produksi.")}>
        Export
      </Button>
      {status ? <span>{status}</span> : null}
    </div>
  );
}

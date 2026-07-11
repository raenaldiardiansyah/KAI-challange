"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function WorkOrderActionButton() {
  const [message, setMessage] = useState("");

  return (
    <div className="inline-action-status">
      <Button icon={<PaperPlaneTilt size={16} />} onClick={() => setMessage("Permintaan tindakan tersimpan di state lokal untuk tim teknisi.")}>
        Request Action
      </Button>
      {message ? <span>{message}</span> : null}
    </div>
  );
}

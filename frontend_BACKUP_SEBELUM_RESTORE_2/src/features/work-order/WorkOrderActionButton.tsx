"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function WorkOrderActionButton() {
  return <Button icon={<PaperPlaneTilt size={16} />} onClick={() => alert("Permintaan tindakan telah dikirim ke tim teknisi.")}>Request Action</Button>;
}

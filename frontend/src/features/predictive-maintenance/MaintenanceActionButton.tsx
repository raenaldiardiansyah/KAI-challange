"use client";

import { ClipboardText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function MaintenanceActionButton() {
  const router = useRouter();
  return <Button icon={<ClipboardText size={16} />} onClick={() => router.push("/work-order")}>Jadwalkan Inspeksi (Buat SPK)</Button>;
}

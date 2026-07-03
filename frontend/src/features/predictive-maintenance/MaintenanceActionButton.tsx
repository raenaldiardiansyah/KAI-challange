import { ClipboardText } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";

export function MaintenanceActionButton() {
  return <Button icon={<ClipboardText size={16} />}>Jadwalkan Inspeksi (Buat SPK)</Button>;
}

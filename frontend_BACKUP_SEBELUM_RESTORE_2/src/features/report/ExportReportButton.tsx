import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";

export function ExportReportButton() {
  return <Button icon={<DownloadSimple size={16} />}>Export</Button>;
}

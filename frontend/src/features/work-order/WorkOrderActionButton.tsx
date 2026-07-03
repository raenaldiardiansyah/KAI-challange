import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";

export function WorkOrderActionButton() {
  return <Button icon={<PaperPlaneTilt size={16} />}>Request Action</Button>;
}

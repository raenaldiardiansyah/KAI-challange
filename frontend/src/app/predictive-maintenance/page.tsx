import { PredictiveMaintenanceWorkspace } from "@/features/predictive-maintenance/PredictiveMaintenanceWorkspace";
import { getMaintenanceRisks } from "@/services/maintenanceService";

export default async function PredictiveMaintenancePage() {
  const risks = await getMaintenanceRisks();

  return <PredictiveMaintenanceWorkspace risks={risks} />;
}

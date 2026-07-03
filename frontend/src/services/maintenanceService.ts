import { maintenanceDummy } from "@/dummy/maintenanceDummy";
import type { MaintenanceRisk } from "@/types/maintenance";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getMaintenanceRisks(): Promise<MaintenanceRisk[]> {
  if (isDummyMode()) return maintenanceDummy;
  try {
    return await fetchFromApi<MaintenanceRisk[]>("/maintenance-risks");
  } catch {
    return maintenanceDummy;
  }
}

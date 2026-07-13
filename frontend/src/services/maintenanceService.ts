import { maintenanceDummy } from "@/dummy/maintenanceDummy";
import type { RamsPredictiveResponse } from "@/types/api";
import { adaptPredictiveList } from "@/adapters/predictiveAdapter";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export async function getMaintenanceRisks(signal?: AbortSignal) {
  const result = await requestRams<RamsPredictiveResponse>("/predictive", { signal, query: { limit: 500 } });
  return mapRamsResult(result, (response) => adaptPredictiveList(response.items));
}

export { maintenanceDummy };

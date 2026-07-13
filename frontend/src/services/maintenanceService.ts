import type { RamsPredictiveResponse } from "@/types/api";
import { adaptPredictiveList } from "@/adapters/predictiveAdapter";
import { predictiveFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export async function getMaintenanceRisks(signal?: AbortSignal, mode: DataMode = "live") {
  const result = await loadRams<RamsPredictiveResponse>(mode, "/predictive", predictiveFixture, { signal, query: { limit: 500 } });
  return mapRamsResult(result, (response) => adaptPredictiveList(response.items));
}

export async function refreshMaintenanceRisks(signal?: AbortSignal) {
  return requestRams<RamsPredictiveResponse>("/predictive/refresh", {
    method: "POST",
    signal
  });
}

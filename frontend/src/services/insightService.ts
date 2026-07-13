import { insightDummy } from "@/dummy/insightDummy";
import type { Insight } from "@/types/insight";
import type { RamsInsightsResponse } from "@/types/api";
import { adaptInsights } from "@/adapters/insightAdapter";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export async function getInsights(signal?: AbortSignal) {
  const result = await requestRams<RamsInsightsResponse>("/insights", { signal, query: { limit: 500 } });
  return mapRamsResult(result, (response) => adaptInsights(response.items));
}

/** @deprecated Detail selection is performed from the shared insight list. */
export async function getInsight(id: string): Promise<Insight | undefined> {
  return insightDummy.find((insight) => insight.id === id);
}

export { insightDummy };

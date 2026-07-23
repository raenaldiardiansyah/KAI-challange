import type { Insight } from "@/types/insight";
import type { RamsInsightsResponse, RamsLlmRecommendationResponse } from "@/types/api";
import { adaptInsights } from "@/adapters/insightAdapter";
import { insightsFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export async function getInsights(signal?: AbortSignal, mode: DataMode = "live") {
  const result = await loadRams<RamsInsightsResponse>(mode, "/insights", insightsFixture, { signal, query: { limit: 500 } });
  return mapRamsResult(result, (response) => adaptInsights(response.items));
}

export async function refreshInsights(signal?: AbortSignal) {
  return requestRams<RamsInsightsResponse>("/insights/refresh", {
    method: "POST",
    signal,
    query: { limit: 500 }
  });
}

export async function generateLlmRecommendation(context: Record<string, unknown>, signal?: AbortSignal) {
  return requestRams<RamsLlmRecommendationResponse>("/llm/recommendation", {
    method: "POST",
    body: { context },
    signal
  });
}

/** @deprecated Detail selection is performed from the shared insight list. */
export async function getInsight(id: string): Promise<Insight | undefined> {
  return adaptInsights(insightsFixture.items).find((insight) => insight.id === id);
}

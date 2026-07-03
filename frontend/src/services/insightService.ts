import { insightDummy } from "@/dummy/insightDummy";
import type { Insight } from "@/types/insight";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getInsights(): Promise<Insight[]> {
  if (isDummyMode()) return insightDummy;
  return fetchFromApi<Insight[]>("/insights");
}

export async function getInsight(id: string): Promise<Insight | undefined> {
  if (isDummyMode()) return insightDummy.find((insight) => insight.id === id);
  return fetchFromApi<Insight>(`/insights/${id}`);
}

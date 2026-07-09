import { insightDummy } from "@/dummy/insightDummy";
import type { Insight } from "@/types/insight";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getInsights(): Promise<Insight[]> {
  if (isDummyMode()) return insightDummy;
  try {
    return await fetchFromApi<Insight[]>("/insights");
  } catch {
    return insightDummy;
  }
}

export async function getInsight(id: string): Promise<Insight | undefined> {
  if (isDummyMode()) return insightDummy.find((insight) => insight.id === id);
  try {
    return await fetchFromApi<Insight>(`/insights/${id}`);
  } catch {
    return insightDummy.find((i) => i.id === id);
  }
}

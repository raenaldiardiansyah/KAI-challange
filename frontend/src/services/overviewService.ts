import { overviewDummy } from "@/dummy/overviewDummy";
import { fetchFromApi, isDummyMode } from "./apiClient";

export type OverviewData = typeof overviewDummy;

export async function getOverviewData(): Promise<OverviewData> {
  if (isDummyMode()) return overviewDummy;
  try {
    return await fetchFromApi<OverviewData>("/overview");
  } catch {
    return overviewDummy;
  }
}

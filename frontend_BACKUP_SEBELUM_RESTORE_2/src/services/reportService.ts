import { reportDummy } from "@/dummy/reportDummy";
import type { Report } from "@/types/report";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getReports(): Promise<Report[]> {
  if (isDummyMode()) return reportDummy;
  try {
    return await fetchFromApi<Report[]>("/reports");
  } catch {
    return reportDummy;
  }
}

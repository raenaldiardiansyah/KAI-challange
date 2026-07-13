import { reportDummy } from "@/dummy/reportDummy";
import type { Report } from "@/types/report";

/** LOCAL / PROTOTYPE: RAMS does not document a report endpoint yet. */
export async function getReports(): Promise<Report[]> {
  return reportDummy;
}

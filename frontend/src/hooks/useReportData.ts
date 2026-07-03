"use client";

import { getReports } from "@/services/reportService";
import { useAsyncData } from "./useAsyncData";

export function useReportData() {
  return useAsyncData(getReports);
}

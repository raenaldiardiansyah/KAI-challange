"use client";

import { getOverviewData } from "@/services/overviewService";
import { useAsyncData } from "./useAsyncData";

export function useOverviewData() {
  return useAsyncData(getOverviewData);
}

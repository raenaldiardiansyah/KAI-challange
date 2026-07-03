"use client";

import { getInsights } from "@/services/insightService";
import { useAsyncData } from "./useAsyncData";

export function useInsightData() {
  return useAsyncData(getInsights);
}

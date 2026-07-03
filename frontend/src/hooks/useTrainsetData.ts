"use client";

import { getTrainsets } from "@/services/trainsetService";
import { useAsyncData } from "./useAsyncData";

export function useTrainsetData() {
  return useAsyncData(getTrainsets);
}

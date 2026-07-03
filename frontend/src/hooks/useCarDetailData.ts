"use client";

import { getCarDetails } from "@/services/carDetailService";
import { useAsyncData } from "./useAsyncData";

export function useCarDetailData() {
  return useAsyncData(getCarDetails);
}

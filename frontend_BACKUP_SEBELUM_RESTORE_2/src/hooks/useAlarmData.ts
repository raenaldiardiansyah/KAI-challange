"use client";

import { getAlarms } from "@/services/alarmService";
import { useAsyncData } from "./useAsyncData";

export function useAlarmData() {
  return useAsyncData(getAlarms);
}

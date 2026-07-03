import { alarmDummy } from "@/dummy/alarmDummy";
import type { Alarm } from "@/types/alarm";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getAlarms(): Promise<Alarm[]> {
  if (isDummyMode()) return alarmDummy;
  return fetchFromApi<Alarm[]>("/alarms");
}

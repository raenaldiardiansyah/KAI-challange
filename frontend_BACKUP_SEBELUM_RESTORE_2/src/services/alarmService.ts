import { alarmDummy } from "@/dummy/alarmDummy";
import type { Alarm } from "@/types/alarm";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getAlarms(): Promise<Alarm[]> {
  if (isDummyMode()) return alarmDummy;
  try {
    return await fetchFromApi<Alarm[]>("/alarms");
  } catch (error) {
    console.error("Failed to fetch alarms, falling back to dummy", error);
    return alarmDummy;
  }
}

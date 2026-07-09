import { telemetryDummy } from "@/dummy/telemetryDummy";
import type { TelemetrySeries } from "@/types/telemetry";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getTelemetry(): Promise<TelemetrySeries[]> {
  if (isDummyMode()) return telemetryDummy;
  try {
    return await fetchFromApi<TelemetrySeries[]>("/telemetry");
  } catch {
    return telemetryDummy;
  }
}

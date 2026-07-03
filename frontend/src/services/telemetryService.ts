import { telemetryDummy } from "@/dummy/telemetryDummy";
import type { TelemetrySeries } from "@/types/telemetry";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getTelemetry(): Promise<TelemetrySeries[]> {
  if (isDummyMode()) return telemetryDummy;
  return fetchFromApi<TelemetrySeries[]>("/telemetry");
}

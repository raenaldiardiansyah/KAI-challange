import type { Alarm } from "@/types/alarm";
import type { RamsActiveAlarmsResponse, RamsAlarmMutationResponse, RamsAlarmsResponse } from "@/types/api";
import { adaptAlarms, type AlarmDiagnosticMatch } from "@/adapters/alarmAdapter";
import { activeAlarmsFixture, alarmsFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, requestRams, type RamsApiResult } from "./api/ramsApiClient";

export async function getAlarms(signal?: AbortSignal, mode: DataMode = "live"): Promise<RamsApiResult<Alarm[]>> {
  const settled = await Promise.allSettled([
    loadRams<RamsAlarmsResponse>(mode, "/alarms", alarmsFixture("ACTIVE"), { signal, query: { status: "ACTIVE", limit: 1000 } }),
    loadRams<RamsAlarmsResponse>(mode, "/alarms", alarmsFixture("ACKED"), { signal, query: { status: "ACKED", limit: 1000 } }),
    loadRams<RamsAlarmsResponse>(mode, "/alarms", alarmsFixture("RESOLVED"), { signal, query: { status: "RESOLVED", limit: 1000 } }),
    loadRams<RamsActiveAlarmsResponse>(mode, "/frontend/alarms/active", activeAlarmsFixture, { signal, query: { limit: 1000 } })
  ]);
  const alarmResults = settled.slice(0, 3)
    .filter((result): result is PromiseFulfilledResult<RamsApiResult<RamsAlarmsResponse>> => result.status === "fulfilled")
    .map((result) => result.value);
  if (alarmResults.length === 0) {
    const rejected = settled.find((result): result is PromiseRejectedResult => result.status === "rejected");
    throw rejected?.reason ?? new Error("Data alarm RAMS belum tersedia.");
  }
  const frontendResult = settled[3].status === "fulfilled" ? settled[3].value : null;
  const diagnostics: AlarmDiagnosticMatch[] = frontendResult
    ? frontendResult.data.items.flatMap((train) => (train.cars ?? []).flatMap((car) => (car.subsystems ?? []).map((subsystem) => ({
        ...subsystem,
        trainsetId: train.trainset,
        carId: car.car
      }))))
    : [];
  const byId = new Map<number, RamsAlarmsResponse["items"][number]>();
  alarmResults.flatMap((result) => result.data.items).forEach((alarm) => byId.set(alarm.id, alarm));
  const results: RamsApiResult<unknown>[] = [...alarmResults, ...(frontendResult ? [frontendResult] : [])];
  return {
    data: adaptAlarms(Array.from(byId.values()), diagnostics),
    ...mergeRamsMetadata(results)
  };
}

export async function acknowledgeAlarm(id: string) {
  return requestRams<RamsAlarmMutationResponse>(`/alarms/${encodeURIComponent(id)}/ack`, {
    method: "POST",
    allowCachedFallback: false
  });
}

export async function resolveAlarm(id: string) {
  return requestRams<RamsAlarmMutationResponse>(`/alarms/${encodeURIComponent(id)}/resolve`, {
    method: "POST",
    allowCachedFallback: false
  });
}

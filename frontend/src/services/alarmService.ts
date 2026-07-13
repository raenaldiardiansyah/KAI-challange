import { alarmDummy } from "@/dummy/alarmDummy";
import type { Alarm } from "@/types/alarm";
import type { RamsActiveAlarmsResponse, RamsAlarmMutationResponse, RamsAlarmsResponse } from "@/types/api";
import { adaptAlarms } from "@/adapters/alarmAdapter";
import { requestRams, type RamsApiResult } from "./api/ramsApiClient";

export async function getAlarms(signal?: AbortSignal): Promise<RamsApiResult<Alarm[]>> {
  const [active, acknowledged, resolved, activeFrontend] = await Promise.all([
    requestRams<RamsAlarmsResponse>("/alarms", { signal, query: { status: "ACTIVE", limit: 1000 } }),
    requestRams<RamsAlarmsResponse>("/alarms", { signal, query: { status: "ACKED", limit: 1000 } }),
    requestRams<RamsAlarmsResponse>("/alarms", { signal, query: { status: "RESOLVED", limit: 1000 } }),
    requestRams<RamsActiveAlarmsResponse>("/frontend/alarms/active", { signal, query: { limit: 1000 } })
  ]);
  const byId = new Map<number, (typeof active.data.items)[number]>();
  [...resolved.data.items, ...acknowledged.data.items, ...active.data.items, ...activeFrontend.data.items]
    .forEach((alarm) => byId.set(alarm.id, alarm));
  const results = [active, acknowledged, resolved, activeFrontend];
  return {
    data: adaptAlarms(Array.from(byId.values())),
    source: results.some((result) => result.source === "cache") ? "cache" : "live",
    stale: results.some((result) => result.stale),
    fetchedAt: results.map((result) => result.fetchedAt).sort().at(-1) ?? new Date().toISOString()
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

export { alarmDummy };

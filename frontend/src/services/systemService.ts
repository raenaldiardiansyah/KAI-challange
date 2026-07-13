import type { RamsDatabaseHealthDto, RamsMqttStatusDto, RamsSystemHealthDto } from "@/types/api";
import { requestRams, type RamsApiResult } from "./api/ramsApiClient";

export type SystemStatusData = {
  apiOk: boolean;
  app: string;
  environment: string;
  databaseOk: boolean;
  database: string;
  telemetrySignals: number;
  eventLogs: number;
  mqttEnabled: boolean;
  mqttConnected: boolean;
  queueSize: number;
  messagesReceived: number;
  messagesProcessed: number;
  lastError: string | null;
};

export const dummySystemStatus: SystemStatusData = {
  apiOk: true,
  app: "Simulasi lokal",
  environment: "dummy",
  databaseOk: true,
  database: "Dummy",
  telemetrySignals: 0,
  eventLogs: 0,
  mqttEnabled: true,
  mqttConnected: true,
  queueSize: 0,
  messagesReceived: 0,
  messagesProcessed: 0,
  lastError: null
};

export async function getSystemStatus(signal?: AbortSignal): Promise<RamsApiResult<SystemStatusData>> {
  const [api, database, mqtt] = await Promise.all([
    requestRams<RamsSystemHealthDto>("/system/health", { signal }),
    requestRams<RamsDatabaseHealthDto>("/system/database-health", { signal }),
    requestRams<RamsMqttStatusDto>("/mqtt/status", { signal })
  ]);
  const results = [api, database, mqtt];
  return {
    data: {
      apiOk: api.data.ok,
      app: api.data.app,
      environment: api.data.env,
      databaseOk: database.data.ok,
      database: database.data.database,
      telemetrySignals: database.data.telemetry_signal,
      eventLogs: database.data.event_log,
      mqttEnabled: mqtt.data.mqtt.enabled,
      mqttConnected: mqtt.data.mqtt.connected,
      queueSize: mqtt.data.mqtt.queue_size,
      messagesReceived: mqtt.data.mqtt.messages_received,
      messagesProcessed: mqtt.data.mqtt.messages_processed,
      lastError: mqtt.data.mqtt.last_error
    },
    source: results.some((result) => result.source === "cache") ? "cache" : "live",
    stale: results.some((result) => result.stale),
    fetchedAt: results.map((result) => result.fetchedAt).sort().at(-1) ?? new Date().toISOString()
  };
}

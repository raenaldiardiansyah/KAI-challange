import type { RamsDatabaseHealthDto, RamsMqttStatusDto, RamsSystemHealthDto } from "@/types/api";
import { databaseHealthFixture, mqttStatusFixture, systemHealthFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mergeRamsMetadata, type RamsApiResult } from "./api/ramsApiClient";

export type SystemStatusData = {
  apiOk: boolean;
  app: string;
  environment: string;
  databaseOk: boolean;
  database: string;
  rawMqttMessages: number;
  telemetrySignals: number;
  eventLogs: number;
  mqttEnabled: boolean;
  mqttConnected: boolean;
  queueSize: number;
  messagesReceived: number;
  messagesProcessed: number;
  mqttStartedAt: string | null;
  lastError: string | null;
  sectionErrors: string[];
};

export async function getSystemStatus(signal?: AbortSignal, mode: DataMode = "live"): Promise<RamsApiResult<SystemStatusData>> {
  const [apiResult, databaseResult, mqttResult] = await Promise.allSettled([
    loadRams<RamsSystemHealthDto>(mode, "/system/health", systemHealthFixture, { signal }),
    loadRams<RamsDatabaseHealthDto>(mode, "/system/database-health", databaseHealthFixture, { signal }),
    loadRams<RamsMqttStatusDto>(mode, "/mqtt/status", mqttStatusFixture, { signal })
  ]);
  const fulfilled: RamsApiResult<unknown>[] = [];
  if (apiResult.status === "fulfilled") fulfilled.push(apiResult.value);
  if (databaseResult.status === "fulfilled") fulfilled.push(databaseResult.value);
  if (mqttResult.status === "fulfilled") fulfilled.push(mqttResult.value);
  if (fulfilled.length === 0) {
    const firstFailure = [apiResult, databaseResult, mqttResult].find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    throw firstFailure?.reason ?? new Error("System diagnostics RAMS tidak tersedia.");
  }
  const api = apiResult.status === "fulfilled" ? apiResult.value : null;
  const database = databaseResult.status === "fulfilled" ? databaseResult.value : null;
  const mqtt = mqttResult.status === "fulfilled" ? mqttResult.value : null;
  const sectionErrors = [
    apiResult.status === "rejected" ? "System health tidak tersedia" : null,
    databaseResult.status === "rejected" ? "Database health tidak tersedia" : null,
    mqttResult.status === "rejected" ? "MQTT status tidak tersedia" : null
  ].filter((value): value is string => Boolean(value));
  return {
    data: {
      apiOk: api?.data.ok ?? false,
      app: api?.data.app ?? "Tidak tersedia",
      environment: api?.data.env ?? "Tidak tersedia",
      databaseOk: database?.data.ok ?? false,
      database: database?.data.database ?? "Tidak tersedia",
      rawMqttMessages: database?.data.raw_mqtt_message ?? 0,
      telemetrySignals: database?.data.telemetry_signal ?? 0,
      eventLogs: database?.data.event_log ?? 0,
      mqttEnabled: mqtt?.data.mqtt.enabled ?? false,
      mqttConnected: mqtt?.data.mqtt.connected ?? false,
      queueSize: mqtt?.data.mqtt.queue_size ?? 0,
      messagesReceived: mqtt?.data.mqtt.messages_received ?? 0,
      messagesProcessed: mqtt?.data.mqtt.messages_processed ?? 0,
      mqttStartedAt: mqtt?.data.mqtt.started_at ?? null,
      lastError: mqtt?.data.mqtt.last_error ?? null,
      sectionErrors
    },
    ...mergeRamsMetadata(fulfilled)
  };
}

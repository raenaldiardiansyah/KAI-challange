export type RamsSystemHealthDto = { ok: boolean; app: string; env: string };

export type RamsDatabaseHealthDto = {
  ok: boolean;
  database: string;
  raw_mqtt_message: number;
  telemetry_signal: number;
  event_log: number;
};

export type RamsMqttStatusDto = {
  ok: boolean;
  mqtt: {
    enabled: boolean;
    connected: boolean;
    last_error: string | null;
    messages_received: number;
    messages_processed: number;
    started_at: string | null;
    queue_size: number;
  };
};

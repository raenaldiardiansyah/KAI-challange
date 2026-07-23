import type { RamsMqttStatusDto } from "@/types/api";

export const mqttStatusFixture: RamsMqttStatusDto = {
  ok: true,
  mqtt: {
    enabled: true,
    connected: true,
    last_error: null,
    messages_received: 1450,
    messages_processed: 1448,
    started_at: "2026-07-13T07:00:00.000Z",
    queue_size: 2
  }
};

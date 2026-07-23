import type { RamsListResponse } from "./commonDto";

export type RamsTelemetryDto = {
  id: number;
  event_time: string;
  trainset_id: string;
  car_id: string | null;
  subsystem: string;
  signal_name: string;
  value: number | string | null;
  value_float: number | null;
  value_text: string | null;
  unit: string | null;
  quality_status: string;
  source_topic: string | null;
};

export type RamsTelemetryResponse = RamsListResponse<RamsTelemetryDto>;

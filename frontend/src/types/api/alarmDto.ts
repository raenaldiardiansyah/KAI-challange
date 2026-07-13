import type { RamsListResponse } from "./commonDto";

export type RamsAlarmDto = {
  id: number;
  title: string;
  description: string;
  trainset_id: string;
  car_id: string | null;
  subsystem: string;
  signal_name: string | null;
  severity: string;
  status: "ACTIVE" | "ACKED" | "RESOLVED" | string;
  observed_value: number | string | null;
  threshold_value: number | string | null;
  evidence: Record<string, unknown> | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
};

export type RamsAlarmsResponse = RamsListResponse<RamsAlarmDto>;
export type RamsAlarmMutationResponse = { ok: boolean; alarm: RamsAlarmDto };
export type RamsActiveAlarmsResponse = RamsListResponse<RamsAlarmDto> & {
  generated_at?: string;
  filters?: Record<string, unknown>;
};

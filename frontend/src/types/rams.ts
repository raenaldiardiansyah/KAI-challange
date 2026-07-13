export type RamsEnvelope<T> = { ok: boolean; items: T[]; generated_at?: string; count?: number; filters?: Record<string, unknown> };

export type RamsTrainsetDto = {
  id: string;
  code?: string | null;
  name?: string | null;
  status?: string | null;
  health_score?: number | null;
  cars?: RamsCarDto[];
};

export type RamsCarDto = {
  id: string;
  code?: string | null;
  name?: string | null;
  trainset_id?: string | null;
  health_score?: number | null;
  status?: string | null;
};

export type RamsAlarmDto = {
  id: string;
  trainset_id?: string | null;
  car_id?: string | null;
  subsystem?: string | null;
  severity?: string | null;
  priority?: string | null;
  status?: string | null;
  title?: string | null;
  message?: string | null;
  created_at?: string | null;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
};

export type RamsTelemetryDto = {
  id?: string;
  trainset_id?: string | null;
  car_id?: string | null;
  subsystem?: string | null;
  signal_name?: string | null;
  value?: number | string | null;
  unit?: string | null;
  quality?: string | null;
  timestamp?: string | null;
};

export type RamsInsightDto = {
  id: string;
  trainset_id?: string | null;
  car_id?: string | null;
  subsystem?: string | null;
  severity?: string | null;
  diagnosis?: string | null;
  recommendation?: string | null;
  evidence?: unknown;
  confidence_score?: number | null;
  created_at?: string | null;
};

export type RamsPredictiveDto = {
  id: string;
  trainset_id?: string | null;
  car_id?: string | null;
  subsystem?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  recommendation?: string | null;
  created_at?: string | null;
};

export type RamsMapItemDto = {
  trainset_id: string;
  latitude?: number | null;
  longitude?: number | null;
  speed_kph?: number | null;
  status?: string | null;
  timestamp?: string | null;
};

export type RamsSystemHealthDto = { ok: boolean; app?: string; env?: string };
export type RamsMqttStatusDto = { ok: boolean; mqtt?: { connected?: boolean; status?: string; last_message_at?: string | null } };

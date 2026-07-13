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

export type RamsDiagnosticAffectedCarDto = {
  car_id: string;
  role?: string;
  confidence?: string;
  bp?: number | null;
  bc?: number | null;
};

export type RamsFrontendAlarmDiagnosticDto = {
  subsystem: string;
  priority: string;
  error: string;
  recommendation: string;
  diagnostic_cases: string[];
  affected_cars: RamsDiagnosticAffectedCarDto[];
  diagnostic_scope: string | null;
  diagnostic_confidence: string | null;
  diagnostic_evidence: string[];
};

export type RamsActiveAlarmsResponse = {
  ok: boolean;
  filters?: Record<string, unknown>;
  items: Array<{
    trainset: string;
    cars: Array<{
      car: string;
      subsystems: RamsFrontendAlarmDiagnosticDto[];
    }>;
  }>;
};

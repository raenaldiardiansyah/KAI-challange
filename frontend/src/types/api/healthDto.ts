import type { RamsFilteredListResponse, RamsRuleMatchDto, RamsSignalValueDto } from "./commonDto";

export type RamsSubsystemHealthDto = {
  id: number;
  trainset_id: string;
  car_id: string;
  subsystem_code: string;
  health_status: string;
  health_score: number | null;
  data_status: string;
  display_status: string;
  primary_rule_id: string | null;
  primary_event_code: string | null;
  reason: string | null;
  last_value_json: Record<string, RamsSignalValueDto> | string | null;
  matched_rules_json: RamsRuleMatchDto[] | string | null;
  source: string;
  last_update: string | null;
  created_at: string;
  updated_at: string;
};

export type RamsCarHealthDto = {
  trainset_id: string;
  car_id: string;
  health_status: string;
  health_score: number | null;
  data_status: string;
  display_status: string;
  degraded_subsystem_count: number;
  critical_subsystem_count: number;
  warning_subsystem_count: number;
  watch_subsystem_count: number;
  offline_subsystem_count: number;
  subsystem_summary_json: Array<Record<string, unknown>> | string | null;
  source: string;
  last_update: string | null;
  updated_at: string;
};

export type RamsTrainsetHealthDto = {
  trainset_id: string;
  display_name: string;
  health_status: string;
  health_score: number | null;
  data_status: string;
  display_status: string;
  total_cars: number;
  online_cars: number;
  degraded_car_count: number;
  critical_car_count: number;
  warning_car_count: number;
  watch_car_count: number;
  offline_car_count: number;
  car_summary_json: Array<Record<string, unknown>> | string | null;
  source: string;
  last_update: string | null;
  updated_at: string;
};

export type RamsSubsystemHealthResponse = RamsFilteredListResponse<RamsSubsystemHealthDto>;
export type RamsCarHealthResponse = RamsFilteredListResponse<RamsCarHealthDto>;
export type RamsTrainsetHealthResponse = RamsFilteredListResponse<RamsTrainsetHealthDto>;

export type RamsConditionMonitoringResponse = {
  ok: boolean;
  generated_at: string;
  context: { trainset_id: string; car_id: string; subsystem: string };
  health: Omit<RamsSubsystemHealthDto, "id" | "trainset_id" | "car_id" | "subsystem_code" | "last_value_json" | "matched_rules_json" | "source" | "created_at">;
  signals: Record<string, RamsSignalValueDto>;
  matched_rules: RamsRuleMatchDto[];
  available_rules: RamsRuleMatchDto[];
};

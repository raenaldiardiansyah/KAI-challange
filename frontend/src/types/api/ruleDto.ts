import type { RamsFilteredListResponse } from "./commonDto";

export type RamsRuleDto = {
  id: number;
  rule_id: string;
  subsystem_ppt: string;
  subsystem_code: string;
  event_code: string;
  level: string;
  condition_expression: string;
  condition_json: Record<string, unknown>;
  rule_type: string;
  recommendation: string;
  validation_status: string;
  source: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type RamsRulesResponse = RamsFilteredListResponse<RamsRuleDto>;

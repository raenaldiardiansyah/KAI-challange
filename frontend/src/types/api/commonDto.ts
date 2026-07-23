export type RamsListResponse<T> = {
  ok: boolean;
  items: T[];
};

export type RamsFilteredListResponse<T> = RamsListResponse<T> & {
  filters: Record<string, unknown>;
  count: number;
};

export type RamsSignalValueDto = {
  unit: string | null;
  label: string;
  value: number | string | null;
};

export type RamsRuleMatchDto = {
  level: string;
  rule_id: string;
  event_code: string;
  recommendation: string;
  condition_expression: string;
  validation_status?: string;
  enabled?: boolean;
};

import type { RamsListResponse } from "./commonDto";

export type RamsInsightDto = {
  id: number;
  source_event_id: number | null;
  trainset_id: string;
  car_id: string | null;
  subsystem: string;
  severity: string;
  title: string;
  summary: string;
  technical_explanation: string;
  probable_causes: string[];
  recommended_actions: string[];
  llm_recommendation: Record<string, unknown> | string | null;
  generated_by: string;
  confidence_score: number | null;
  created_at: string;
};

export type RamsInsightsResponse = RamsListResponse<RamsInsightDto>;

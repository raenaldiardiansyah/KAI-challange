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

export type RamsLlmAffectedCarDto = {
  car_id: string;
  role: string;
  reason: string;
  confidence: number | string | null;
};

export type RamsLlmRecommendationDto = {
  title: string;
  summary: string;
  technical_explanation: string;
  affected_cars: RamsLlmAffectedCarDto[];
  probable_causes: string[];
  recommended_actions: string[];
  inspection_steps: string[];
  safety_notes: string[];
  priority: string;
  provider: string;
  model: string;
  llm_status: string;
};

export type RamsLlmRecommendationResponse = {
  ok: boolean;
  recommendation: RamsLlmRecommendationDto;
};

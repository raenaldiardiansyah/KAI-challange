import type { RamsListResponse } from "./commonDto";

export type RamsPredictiveDto = {
  id: number;
  trainset_id: string;
  car_id: string | null;
  subsystem: string;
  prediction_type: string;
  risk_score: number | null;
  predicted_status: string;
  recommendation: string;
  features: Record<string, number | string | null>;
  created_at: string;
};

export type RamsPredictiveResponse = RamsListResponse<RamsPredictiveDto>;

import type { RamsAlarmDto } from "./alarmDto";
import type { RamsInsightDto } from "./insightDto";
import type { RamsPredictiveDto } from "./predictiveDto";
import type { RamsTrainDto } from "./trainsetDto";

export type RamsFrontendMetricsDto = {
  total_trains: number;
  online_trains: number;
  total_cars: number;
  online_cars: number;
  active_alarms: number;
  critical_alarms: number;
  average_health_score: number;
  data_availability_percent: number;
};

export type RamsFrontendPositionDto = {
  trainset_id: string;
  display_name: string;
  latitude: number | null;
  longitude: number | null;
  speed_kph: number | null;
  status: string;
  last_update: string | null;
};

export type RamsFrontendStateDto = {
  ok: boolean;
  generated_at: string;
  metrics: RamsFrontendMetricsDto;
  trains: RamsTrainDto[];
  alarms: RamsAlarmDto[];
  insights: RamsInsightDto[];
  llm_recommendations: unknown[];
  predictive: RamsPredictiveDto[];
  positions: RamsFrontendPositionDto[];
};

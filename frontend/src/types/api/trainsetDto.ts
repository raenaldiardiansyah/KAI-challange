export type RamsPositionDto = {
  latitude: number | null;
  longitude: number | null;
  speed_kph: number | null;
};

export type RamsSubsystemDto = {
  subsystem: string;
  status: string;
  health_score: number | null;
  active_alarm_count: number;
  signal_count?: number;
  latest_values: Record<string, number | string | null>;
  last_update: string | null;
};

export type RamsTrainCarDto = {
  car_id: string;
  status: string;
  health_score: number | null;
  last_update: string | null;
  subsystems: RamsSubsystemDto[];
};

export type RamsTrainDto = {
  trainset_id: string;
  display_name: string;
  status: string;
  health_score: number | null;
  total_cars: number;
  online_cars: number;
  active_alarm_count: number;
  last_update: string | null;
  position: RamsPositionDto | null;
  cars: RamsTrainCarDto[];
};

export type RamsTrainsetListResponse = { ok: boolean; trains: RamsTrainDto[] };
export type RamsTrainsetResponse = { ok: boolean; train: RamsTrainDto };

export type RamsFrontendTrainsetItemDto = {
  trainset: string;
  cars_connected: string[];
};

export type RamsFrontendTrainsetsResponse = {
  ok: boolean;
  generated_at: string;
  total: number;
  limit: number;
  offset: number;
  items: RamsFrontendTrainsetItemDto[];
};

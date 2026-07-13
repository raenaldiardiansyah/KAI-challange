import type { RamsListResponse } from "./commonDto";

export type RamsPhaseValuesDto = {
  r: number | null;
  s: number | null;
  t: number | null;
};

export type RamsAcCarDto = {
  car: string;
  actual_humidity: number | null;
  actual_temperature: number | null;
  voltage_value_rst: RamsPhaseValuesDto;
  compressor_1_current_value_rst: RamsPhaseValuesDto;
  compressor_2_current_value_rst: RamsPhaseValuesDto;
  compressor_3_current_value_rst: RamsPhaseValuesDto;
};

export type RamsAcSubsystemResponse = RamsListResponse<{
  trainset: string;
  cars: RamsAcCarDto[];
}> & {
  generated_at: string;
  filters: { trainset: string | null; car: string | null };
};

export type RamsPressureBrakeCarDto = {
  car: string;
  bc: number | null;
  bp: number | null;
};

export type RamsPressureBrakeResponse = RamsListResponse<{
  trainset: string;
  cars: RamsPressureBrakeCarDto[];
}> & {
  generated_at: string;
  filters: { trainset: string | null; car: string | null };
};

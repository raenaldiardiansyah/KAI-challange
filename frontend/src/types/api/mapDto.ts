import type { RamsListResponse } from "./commonDto";

export type RamsMapItemDto = {
  trainset: string;
  lat: number | null;
  long: number | null;
  speed: number | null;
};

export type RamsMapsResponse = RamsListResponse<RamsMapItemDto> & {
  generated_at: string;
};

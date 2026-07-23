import type { RamsSubsystemDto } from "./trainsetDto";

export type RamsCarDetailDto = {
  trainset_id: string;
  car_id: string;
  subsystems: RamsSubsystemDto[];
};

export type RamsCarDetailResponse = { ok: boolean; car: RamsCarDetailDto };

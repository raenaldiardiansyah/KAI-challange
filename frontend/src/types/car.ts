import type { HealthStatus, SubsystemName } from "./common";

export type CarSubsystem = {
  subsystem: SubsystemName;
  healthScore: number;
  status: HealthStatus;
  evidence: string;
};

export type CarDetail = {
  id: string;
  trainsetId: string;
  carNumber: number;
  role: string;
  healthScore: number;
  healthStatus: HealthStatus;
  brakePipeBar: number;
  brakeCylinderBar: number;
  gensetVoltage: number;
  gensetFrequency: number;
  gensetRpm: number;
  fuelLevel: number;
  hvacTemperature: number;
  doorOpenCount: number;
  doorStatus: string;
  subsystems: CarSubsystem[];
};

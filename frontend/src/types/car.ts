import type { HealthStatus, SubsystemName } from "./common";

export type CarSubsystem = {
  subsystem: SubsystemName;
  healthScore: number;
  status: HealthStatus;
  evidence: string;
};

export type CarSensorValue = {
  key: string;
  label: string;
  value: number | string | null;
  unit: string | null;
  quality?: string | null;
  updatedAt?: string | null;
};

export type CarRuleMatch = {
  ruleId: string;
  eventCode: string;
  level: string;
  condition: string;
  recommendation: string;
  validationStatus?: string | null;
  enabled?: boolean;
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
  backendCarId?: string;
  dataStatus?: string | null;
  selectedSubsystemCode?: string;
  activeAlarmCount?: number;
  signalCount?: number;
  criticalSubsystemCount?: number;
  warningSubsystemCount?: number;
  primaryRuleId?: string | null;
  primaryEventCode?: string | null;
  healthReason?: string | null;
  healthSource?: string | null;
  healthUpdatedAt?: string | null;
  sensorValues?: CarSensorValue[];
  matchedRules?: CarRuleMatch[];
  availableRules?: CarRuleMatch[];
};

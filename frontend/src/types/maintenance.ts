import type { Severity, SubsystemName } from "./common";

export type MaintenanceRisk = {
  id: string;
  trainsetId: string;
  carNumber: number;
  subsystem: SubsystemName;
  severity: Severity;
  riskScore: number;
  timeToWarning: string;
  recommendation: string;
  workOrderReady: boolean;
};

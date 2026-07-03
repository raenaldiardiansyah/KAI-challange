import type { AlarmStatus, Severity, SubsystemName } from "./common";

export type Alarm = {
  id: string;
  trainsetId: string;
  carNumber: number;
  subsystem: SubsystemName;
  severity: Severity;
  status: AlarmStatus;
  message: string;
  detectedAt: string;
  lastUpdate: string;
};

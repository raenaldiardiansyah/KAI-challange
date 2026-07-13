import type { AlarmStatus, Severity, SubsystemName } from "./common";

export type Alarm = {
  id: string;
  trainsetId: string;
  trainsetCode?: string;
  carId?: string | null;
  carNumber: number;
  subsystem: SubsystemName;
  subsystemCode?: string;
  severity: Severity;
  status: AlarmStatus;
  message: string;
  detectedAt: string;
  lastUpdate: string;
};

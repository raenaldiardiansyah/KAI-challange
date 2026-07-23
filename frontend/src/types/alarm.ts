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
  title?: string;
  signalName?: string | null;
  observedValue?: number | string | null;
  thresholdValue?: number | string | null;
  evidence?: unknown;
  recommendation?: string | null;
  diagnosticCases?: string[];
  affectedCars?: Array<{ carId: string; role?: string; confidence?: string; bp?: number | null; bc?: number | null }>;
  diagnosticScope?: string | null;
  diagnosticConfidence?: string | null;
  diagnosticEvidence?: string[];
};

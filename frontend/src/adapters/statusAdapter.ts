import type { AlarmStatus, DataStatus, HealthStatus, Severity, SubsystemName } from "@/types/common";

export function adaptSeverity(value: string | null | undefined): Severity {
  switch (value?.toUpperCase()) {
    case "CRITICAL": return "Critical";
    case "WARNING":
    case "HIGH_RISK": return "High";
    case "WATCH": return "Medium";
    case "INFO": return "Low";
    default: return "Normal";
  }
}

export function adaptHealthStatus(value: string | null | undefined): HealthStatus {
  switch (value?.toUpperCase()) {
    case "CRITICAL": return "Critical";
    case "WARNING": return "Warning";
    case "WATCH": return "Watch";
    case "OFFLINE": return "Offline";
    case "ONLINE":
    case "GOOD":
    case "NORMAL":
    case "HEALTHY": return "Healthy";
    default: return "Data Limited";
  }
}

export function adaptDataStatus(value: string | null | undefined): DataStatus {
  switch (value?.toUpperCase()) {
    case "ONLINE":
    case "GOOD": return "Online";
    case "DELAYED":
    case "STALE": return "Delayed";
    case "OFFLINE":
    case "DISCONNECTED": return "Disconnected";
    case "ERROR": return "Error";
    default: return "No Data";
  }
}

export function adaptAlarmStatus(value: string): AlarmStatus {
  switch (value.toUpperCase()) {
    case "ACTIVE": return "Open";
    case "ACKED": return "Acknowledged";
    case "RESOLVED": return "Closed";
    default: return "Open";
  }
}

export function adaptSubsystem(value: string | null | undefined): SubsystemName {
  switch (value?.toUpperCase()) {
    case "PRESSURE":
    case "BRAKE": return "Brake System";
    case "AC":
    case "HVAC": return "HVAC";
    case "DOOR": return "Door";
    case "GENSET": return "Genset";
    case "PIDS": return "PIDS";
    case "COMMUNICATION": return "Communication";
    default: return "All Systems";
  }
}

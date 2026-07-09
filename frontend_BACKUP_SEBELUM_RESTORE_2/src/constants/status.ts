import type { DataStatus, HealthStatus } from "@/types/common";

export const healthStatusClass: Record<HealthStatus, string> = {
  Healthy: "status-healthy",
  Watch: "status-watch",
  Warning: "status-warning",
  Alarm: "status-alarm",
  Critical: "status-critical",
  Offline: "status-offline",
  "Data Limited": "status-limited"
};

export const dataStatusLabel: Record<DataStatus, string> = {
  Online: "Online",
  Delayed: "Delayed",
  Disconnected: "Disconnected",
  "No Data": "No Data",
  Error: "Error"
};

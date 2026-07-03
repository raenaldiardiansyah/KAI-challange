import type { HealthStatus } from "@/types/common";

export function getHealthStatus(score: number): HealthStatus {
  if (score < 35) return "Critical";
  if (score < 55) return "Alarm";
  if (score < 70) return "Warning";
  if (score < 85) return "Watch";
  return "Healthy";
}

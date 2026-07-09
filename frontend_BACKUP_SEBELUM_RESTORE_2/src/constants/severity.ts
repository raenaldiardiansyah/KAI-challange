import type { Severity } from "@/types/common";

export const severityRank: Record<Severity, number> = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Normal: 1
};

export const severityClass: Record<Severity, string> = {
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
  Normal: "severity-normal"
};

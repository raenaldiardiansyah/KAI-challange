import type { Severity } from "@/types/common";

export function getSeverityColor(severity: Severity) {
  return {
    Critical: "#b42318",
    High: "#d92d20",
    Medium: "#f79009",
    Low: "#1570ef",
    Normal: "#039855"
  }[severity];
}

export type UiStatus = "normal" | "warning" | "critical" | "offline" | "unknown";

export function normalizeRamsStatus(value: string | null | undefined): UiStatus {
  switch (value?.trim().toUpperCase()) {
    case "ONLINE":
    case "GOOD":
    case "HEALTHY":
    case "NORMAL":
    case "RESOLVED":
      return "normal";
    case "WATCH":
    case "WARNING":
    case "ACKED":
      return "warning";
    case "CRITICAL":
    case "HIGH_RISK":
    case "ACTIVE":
      return "critical";
    case "OFFLINE":
    case "DISCONNECTED":
      return "offline";
    default:
      return "unknown";
  }
}

export function normalizeScore(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

export function displayBackendId(id: string | null | undefined, fallback = "—") {
  return id?.trim() || fallback;
}

export function parseBackendTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

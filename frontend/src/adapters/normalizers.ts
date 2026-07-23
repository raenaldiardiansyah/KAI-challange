export function normalizeScore(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.round(Math.max(0, Math.min(100, value <= 1 ? value * 100 : value)) * 10) / 10;
}

export function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum tersedia";
  return date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" });
}

export function numericValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

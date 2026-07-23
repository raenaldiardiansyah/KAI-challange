export type SafeJsonValue =
  | { kind: "empty"; value: null }
  | { kind: "json"; value: unknown }
  | { kind: "text"; value: string };

export function safeJsonValue(value: unknown): SafeJsonValue {
  if (value == null || value === "") return { kind: "empty", value: null };
  if (typeof value !== "string") return { kind: "json", value };

  try {
    return { kind: "json", value: JSON.parse(value) as unknown };
  } catch {
    return { kind: "text", value };
  }
}

export function safeJsonArray<T = unknown>(value: unknown): T[] {
  const parsed = safeJsonValue(value);
  return parsed.kind === "json" && Array.isArray(parsed.value) ? parsed.value as T[] : [];
}

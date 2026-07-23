import { describe, expect, it } from "vitest";
import { safeJsonArray, safeJsonValue } from "../safeJson";

describe("safeJson", () => {
  it("parses JSON objects and arrays without throwing", () => {
    expect(safeJsonValue('{"status":"ok"}')).toEqual({ kind: "json", value: { status: "ok" } });
    expect(safeJsonArray<number>("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("preserves plain or invalid JSON strings as text", () => {
    expect(safeJsonValue("sensor offline")).toEqual({ kind: "text", value: "sensor offline" });
    expect(safeJsonValue("{invalid")).toEqual({ kind: "text", value: "{invalid" });
  });

  it("handles empty and already parsed values", () => {
    expect(safeJsonValue(null)).toEqual({ kind: "empty", value: null });
    expect(safeJsonValue({ ok: true })).toEqual({ kind: "json", value: { ok: true } });
    expect(safeJsonArray("not an array")).toEqual([]);
  });
});


import { describe, expect, it } from "vitest";
import { normalizeRamsStatus, normalizeScore, parseBackendTimestamp } from "../ramsAdapters";

describe("RAMS adapters", () => {
  it("maps known backend statuses and keeps unknown values explicit", () => {
    expect(normalizeRamsStatus("GOOD")).toBe("normal");
    expect(normalizeRamsStatus("HIGH_RISK")).toBe("critical");
    expect(normalizeRamsStatus("future-value")).toBe("unknown");
  });

  it("normalizes 0-1 and 0-100 scores defensively", () => {
    expect(normalizeScore(0.72)).toBe(72);
    expect(normalizeScore(72)).toBe(72);
    expect(normalizeScore(150)).toBe(100);
    expect(normalizeScore(null)).toBeNull();
  });

  it("rejects invalid timestamps", () => {
    expect(parseBackendTimestamp("invalid")).toBeNull();
    expect(parseBackendTimestamp("2026-07-13T00:00:00Z")?.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });
});

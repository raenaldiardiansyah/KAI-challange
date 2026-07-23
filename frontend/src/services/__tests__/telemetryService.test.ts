import { beforeEach, describe, expect, it, vi } from "vitest";
import { filterTelemetryRecords, getTelemetryData } from "../telemetryService";
import { telemetryRamsDummy } from "@/dummy/telemetryRamsDummy";

describe("telemetry service", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("merges documented latest/history wrappers and deduplicates record IDs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const record = telemetryRamsDummy[0];
      const items = String(input).includes("/history") ? [record, telemetryRamsDummy[1]] : [record];
      return new Response(JSON.stringify({ ok: true, items }), { status: 200 });
    });

    const result = await getTelemetryData();
    expect(result.data.records.map((item) => item.id)).toEqual([1, 2]);
    expect(result).toMatchObject({ source: "live", fromCache: false, stale: false });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/rams/telemetry/latest"), expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/rams/telemetry/history"), expect.anything());
  });

  it("keeps partial live data when one independent telemetry request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (String(input).includes("/latest")) return new Response("unavailable", { status: 503 });
      return new Response(JSON.stringify({ ok: true, items: [telemetryRamsDummy[2]] }), { status: 200 });
    });

    const result = await getTelemetryData();
    expect(result.data.records).toHaveLength(1);
    expect(result.data.records[0].id).toBe(3);
  });

  it("applies quality filters locally without changing the RAMS DTO", () => {
    const bad = filterTelemetryRecords(telemetryRamsDummy, { qualityStatus: "BAD" });
    expect(bad).toHaveLength(2);
    expect(bad).toEqual(expect.arrayContaining([
      expect.objectContaining({ quality_status: "BAD", signal_name: "brake_cylinder" }),
      expect.objectContaining({ quality_status: "BAD", car_id: "UNKNOWN-CAR", value: null })
    ]));
  });
});

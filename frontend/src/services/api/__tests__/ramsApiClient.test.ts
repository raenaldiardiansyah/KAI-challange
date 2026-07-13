import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildRamsBffUrl, requestRams } from "../ramsApiClient";

describe("RAMS API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("builds a local BFF URL and omits empty query values", () => {
    expect(buildRamsBffUrl("/telemetry/history", { trainset_id: "TS 1", limit: 25, car_id: null }))
      .toBe("/api/rams/telemetry/history?trainset_id=TS+1&limit=25");
  });

  it("stores successful GET data and returns it as stale when live fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, items: [1] }), { status: 200 }))
      .mockRejectedValueOnce(new Error("offline"));

    const live = await requestRams<{ ok: boolean; items: number[] }>("/telemetry/latest");
    const cached = await requestRams<{ ok: boolean; items: number[] }>("/telemetry/latest");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(live.source).toBe("live");
    expect(cached).toMatchObject({ source: "cache", stale: true, data: { ok: true, items: [1] } });
  });

  it("normalizes validation errors without using dummy data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: [{ loc: ["query", "limit"], msg: "invalid" }] }), { status: 422 })
    );
    await expect(requestRams("/telemetry/latest", { allowCachedFallback: false }))
      .rejects.toMatchObject({ status: 422, message: "limit: invalid" });
  });
});

import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { setDataMode } from "@/services/api/dataMode";
import { useRamsResource } from "../useRamsResource";
import { createRamsFixtureResult } from "@/services/api/ramsApiClient";

function wrapper({ children }: PropsWithChildren) {
  return <DataModeProvider>{children}</DataModeProvider>;
}

describe("useRamsResource", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("loads Dummy Mode through the same resource loader pipeline", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    window.localStorage.clear();
    const dummyData = { value: "dummy" };
    const loader = vi.fn(async (_signal: AbortSignal, mode: "dummy" | "live") => {
      if (mode !== "dummy") throw new Error("unexpected live call");
      return createRamsFixtureResult(dummyData);
    });

    const { result } = renderHook(() => useRamsResource(loader), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ value: "dummy" }));
    expect(result.current.source).toBe("dummy");
    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader.mock.calls[0][1]).toBe("dummy");
  });

  it("shows a live error without silently falling back to dummy data", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    const dummyData = { value: "dummy" };
    const loader = vi.fn(async (_signal: AbortSignal, mode: "dummy" | "live") => {
      if (mode === "dummy") return createRamsFixtureResult(dummyData);
      throw new Error("RAMS offline");
    });

    const { result } = renderHook(() => useRamsResource(loader), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(dummyData));
    act(() => setDataMode("live"));

    await waitFor(() => expect(result.current.error).toBe("RAMS offline"));
    expect(result.current.mode).toBe("live");
    expect(result.current.source).toBe("live");
    expect(result.current.data).toBeNull();
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

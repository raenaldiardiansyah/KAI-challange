import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { setDataMode } from "@/services/api/dataMode";
import { useRamsResource } from "../useRamsResource";

function wrapper({ children }: PropsWithChildren) {
  return <DataModeProvider>{children}</DataModeProvider>;
}

describe("useRamsResource", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("uses dummy data without calling the live loader in Dummy Mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    window.localStorage.clear();
    const loader = vi.fn();
    const dummyData = { value: "dummy" };

    const { result } = renderHook(() => useRamsResource(dummyData, loader), { wrapper });

    await waitFor(() => expect(result.current.source).toBe("dummy"));
    expect(result.current.data).toEqual({ value: "dummy" });
    expect(loader).not.toHaveBeenCalled();
  });

  it("shows a live error without silently falling back to dummy data", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    const loader = vi.fn().mockRejectedValue(new Error("RAMS offline"));
    const dummyData = { value: "dummy" };

    const { result } = renderHook(() => useRamsResource(dummyData, loader), { wrapper });
    act(() => setDataMode("live"));

    await waitFor(() => expect(result.current.error).toBe("RAMS offline"));
    expect(result.current.mode).toBe("live");
    expect(result.current.source).toBe("empty");
    expect(result.current.data).toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);
  });
});

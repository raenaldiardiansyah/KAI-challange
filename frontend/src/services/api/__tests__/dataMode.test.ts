import { beforeEach, describe, expect, it, vi } from "vitest";

describe("data mode", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("keeps dummy as the safe default", async () => {
    const mode = await import("../dataMode");
    expect(mode.getDefaultDataMode()).toBe("dummy");
    expect(mode.getDataMode()).toBe("dummy");
  });

  it("allows live only when the environment flag is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    const mode = await import("../dataMode");
    mode.setDataMode("live");
    expect(mode.getDataMode()).toBe("live");
  });
});

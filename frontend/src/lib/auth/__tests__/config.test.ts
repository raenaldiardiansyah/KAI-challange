import { afterEach, describe, expect, it } from "vitest";
import { buildRamsApiUrl, getRamsApiBaseUrl, isRamsAuthEnabled } from "../config";

const originalBackendUrl = process.env.RAMS_BACKEND_URL;
const originalAuthEnabled = process.env.RAMS_AUTH_ENABLED;

afterEach(() => {
  process.env.RAMS_BACKEND_URL = originalBackendUrl;
  process.env.RAMS_AUTH_ENABLED = originalAuthEnabled;
});

describe("RAMS auth config", () => {
  it("builds the documented API v1 URL", () => {
    process.env.RAMS_BACKEND_URL = "http://localhost:8000/";
    expect(getRamsApiBaseUrl()).toBe("http://localhost:8000/api/v1");
    expect(buildRamsApiUrl("/auth/login")).toBe("http://localhost:8000/api/v1/auth/login");
  });

  it("only enables route enforcement explicitly", () => {
    process.env.RAMS_AUTH_ENABLED = "false";
    expect(isRamsAuthEnabled()).toBe(false);
    process.env.RAMS_AUTH_ENABLED = "true";
    expect(isRamsAuthEnabled()).toBe(true);
  });
});

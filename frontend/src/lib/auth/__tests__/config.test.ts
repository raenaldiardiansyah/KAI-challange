import { afterEach, describe, expect, it } from "vitest";
import {
  buildAuthApiUrl,
  buildRamsDataApiUrl,
  getAuthApiBaseUrl,
  getRamsDataApiBaseUrl,
  isRamsAuthEnabled
} from "../config";

const originalBackendUrl = process.env.RAMS_BACKEND_URL;
const originalAuthBackendUrl = process.env.AUTH_BACKEND_URL;
const originalDataBackendUrl = process.env.RAMS_DATA_BACKEND_URL;
const originalAuthEnabled = process.env.RAMS_AUTH_ENABLED;

afterEach(() => {
  process.env.RAMS_BACKEND_URL = originalBackendUrl;
  process.env.AUTH_BACKEND_URL = originalAuthBackendUrl;
  process.env.RAMS_DATA_BACKEND_URL = originalDataBackendUrl;
  process.env.RAMS_AUTH_ENABLED = originalAuthEnabled;
});

describe("RAMS auth config", () => {
  it("keeps authentication and RAMS data on separate backends", () => {
    process.env.AUTH_BACKEND_URL = "https://auth.example.com/";
    process.env.RAMS_DATA_BACKEND_URL = "https://data.example.com/";

    expect(getAuthApiBaseUrl()).toBe("https://auth.example.com/api/v1");
    expect(getRamsDataApiBaseUrl()).toBe("https://data.example.com/api/v1");
    expect(buildAuthApiUrl("/auth/login")).toBe("https://auth.example.com/api/v1/auth/login");
    expect(buildRamsDataApiUrl("/frontend/state")).toBe("https://data.example.com/api/v1/frontend/state");
  });

  it("supports the legacy shared backend variable during migration", () => {
    delete process.env.AUTH_BACKEND_URL;
    delete process.env.RAMS_DATA_BACKEND_URL;
    process.env.RAMS_BACKEND_URL = "http://localhost:8000/";

    expect(getAuthApiBaseUrl()).toBe("http://localhost:8000/api/v1");
    expect(getRamsDataApiBaseUrl()).toBe("http://localhost:8000/api/v1");
  });

  it("only enables route enforcement explicitly", () => {
    process.env.RAMS_AUTH_ENABLED = "false";
    expect(isRamsAuthEnabled()).toBe(false);
    process.env.RAMS_AUTH_ENABLED = "true";
    expect(isRamsAuthEnabled()).toBe(true);
  });
});

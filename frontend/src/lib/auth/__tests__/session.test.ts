import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieValues = new Map<string, string>();
const cookieStore = {
  get: vi.fn((name: string) => {
    const value = cookieValues.get(name);
    return value ? { value } : undefined;
  }),
  set: vi.fn((name: string, value: string) => {
    if (value) cookieValues.set(name, value);
    else cookieValues.delete(name);
  })
};

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore
}));

import { fetchRamsWithSession } from "../session";

describe("RAMS session refresh", () => {
  beforeEach(() => {
    cookieValues.clear();
    cookieValues.set("rams_access_token", "expired-access");
    cookieValues.set("rams_refresh_token", "valid-refresh");
    cookieStore.get.mockClear();
    cookieStore.set.mockClear();
    vi.unstubAllGlobals();
  });

  it("refreshes once after 401 and retries the original request once", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        access_token: "new-access",
        refresh_token: "new-refresh",
        token_type: "bearer",
        expires_in: 1800
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchRamsWithSession("/frontend/state");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(cookieValues.get("rams_access_token")).toBe("new-access");
    expect(cookieValues.get("rams_refresh_token")).toBe("new-refresh");
  });

  it("clears the session and does not retry when refresh fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchRamsWithSession("/frontend/state");

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cookieValues.has("rams_access_token")).toBe(false);
    expect(cookieValues.has("rams_refresh_token")).toBe(false);
  });
});

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/config";

describe("authentication proxy", () => {
  it("redirects a direct overview request to login without a session", () => {
    const response = proxy(new NextRequest("http://localhost:3000/overview"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Foverview",
    );
  });

  it("allows overview when an access-token cookie exists", () => {
    const request = new NextRequest("http://localhost:3000/overview", {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=valid-access-token`,
      },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an authenticated user away from the login page", () => {
    const request = new NextRequest("http://localhost:3000/login", {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=valid-access-token`,
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/overview",
    );
  });
});

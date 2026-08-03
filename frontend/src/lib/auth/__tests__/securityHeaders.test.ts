import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("security response headers", () => {
  it("prevents framing and MIME sniffing", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      entries?.flatMap((entry) => entry.headers.map((header) => [header.key, header.value] as const)),
    );

    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("allows the configured MapLibre tile providers", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      entries?.flatMap((entry) => entry.headers.map((header) => [header.key, header.value] as const)),
    );
    const policy = headers.get("Content-Security-Policy");

    expect(policy).toContain(
      "img-src 'self' data: blob: https://basemaps.cartocdn.com https://a.tiles.openrailwaymap.org",
    );
    expect(policy).toContain(
      "connect-src 'self' https://api.emailjs.com https://basemaps.cartocdn.com https://a.tiles.openrailwaymap.org",
    );
  });

  it("allows EmailJS notification requests", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      entries?.flatMap((entry) => entry.headers.map((header) => [header.key, header.value] as const)),
    );

    expect(headers.get("Content-Security-Policy")).toContain(
      "connect-src 'self' https://api.emailjs.com",
    );
  });
});

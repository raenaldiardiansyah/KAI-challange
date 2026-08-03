import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { isTrustedMutationRequest } from "../requestSecurity";

function request(headers: Record<string, string>) {
  return new NextRequest("https://kai.example/api/auth/logout", {
    method: "POST",
    headers,
  });
}

describe("isTrustedMutationRequest", () => {
  it("allows a same-origin browser mutation", () => {
    expect(isTrustedMutationRequest(request({
      origin: "https://kai.example",
      "sec-fetch-site": "same-origin",
    }))).toBe(true);
  });

  it("rejects cross-site browser mutations", () => {
    expect(isTrustedMutationRequest(request({
      origin: "https://attacker.example",
      "sec-fetch-site": "cross-site",
    }))).toBe(false);
  });

  it("rejects a mismatched origin even without fetch metadata", () => {
    expect(isTrustedMutationRequest(request({
      origin: "https://attacker.example",
    }))).toBe(false);
  });
});

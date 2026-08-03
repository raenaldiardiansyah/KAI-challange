import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isTrustedMutationRequest(request: NextRequest) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site" || fetchSite === "same-site") return false;

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return false;

  return fetchSite === "same-origin" || fetchSite === "none" || !origin;
}

export function rejectUntrustedMutation(request: NextRequest) {
  if (isTrustedMutationRequest(request)) return null;
  return NextResponse.json(
    { detail: "Request ditolak karena berasal dari situs yang tidak dipercaya." },
    { status: 403 },
  );
}

export function backendRequestHeaders(request: NextRequest) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);
  if (userAgent) headers.set("User-Agent", userAgent);
  return headers;
}

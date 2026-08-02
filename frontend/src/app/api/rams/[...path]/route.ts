import { NextRequest } from "next/server";
import { fetchRamsWithSession } from "@/lib/auth/session";
import { relayRamsResponse } from "@/lib/auth/response";
import { rejectUntrustedMutation } from "@/lib/auth/requestSecurity";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;

  const { path } = await context.params;
  const backendPath = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");

  if (contentType) headers.set("Content-Type", contentType);

  const requestBody = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  try {
    const response = await fetchRamsWithSession(backendPath, {
      method: request.method,
      headers,
      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined
    });
    return relayRamsResponse(response);
  } catch {
    return Response.json({ detail: "RAMS Backend tidak dapat dihubungi." }, { status: 503 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;

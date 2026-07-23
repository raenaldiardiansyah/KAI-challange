import { NextResponse } from "next/server";

export async function relayRamsResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "application/json";
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": contentType }
  });
}

export function authError(detail: string, status: number) {
  return NextResponse.json({ detail }, { status });
}

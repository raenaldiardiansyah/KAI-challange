import { NextResponse } from "next/server";
import { fetchRamsWithSession } from "@/lib/auth/session";
import { relayRamsResponse } from "@/lib/auth/response";
import type { RamsUserDto } from "@/types/auth";
import { mapAuthUser } from "@/types/auth";

export async function GET() {
  try {
    const response = await fetchRamsWithSession("/auth/me");
    if (!response.ok) return relayRamsResponse(response);

    const user = await response.json() as RamsUserDto;
    return NextResponse.json({ ok: true, user: mapAuthUser(user) });
  } catch {
    return NextResponse.json({ detail: "RAMS Backend tidak dapat dihubungi." }, { status: 503 });
  }
}

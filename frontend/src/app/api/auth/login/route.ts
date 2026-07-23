import { NextRequest, NextResponse } from "next/server";
import { buildRamsApiUrl } from "@/lib/auth/config";
import { authError, relayRamsResponse } from "@/lib/auth/response";
import { setLoginSession } from "@/lib/auth/session";
import type { RamsLoginResponse } from "@/types/auth";
import { mapAuthUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  let credentials: { username?: string; password?: string };

  try {
    credentials = await request.json();
  } catch {
    return authError("Request login tidak valid.", 400);
  }

  if (!credentials.username?.trim() || !credentials.password) {
    return authError("Username dan password wajib diisi.", 422);
  }

  try {
    const response = await fetch(buildRamsApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password
      }),
      cache: "no-store"
    });

    if (!response.ok) return relayRamsResponse(response);

    const payload = await response.json() as RamsLoginResponse;
    await setLoginSession(payload);
    return NextResponse.json({ ok: true, user: mapAuthUser(payload.user) });
  } catch {
    return authError("RAMS Backend tidak dapat dihubungi.", 503);
  }
}

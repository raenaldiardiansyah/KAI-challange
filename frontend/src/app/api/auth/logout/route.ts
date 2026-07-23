import { NextResponse } from "next/server";
import { buildRamsApiUrl } from "@/lib/auth/config";
import { clearLoginSession, getAccessToken } from "@/lib/auth/session";

export async function POST() {
  const accessToken = await getAccessToken();

  try {
    if (accessToken) {
      await fetch(buildRamsApiUrl("/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store"
      });
    }
  } catch {
    // Local session cleanup must still succeed when RAMS is unavailable.
  } finally {
    await clearLoginSession();
  }

  return NextResponse.json({ ok: true });
}

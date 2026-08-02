import { NextRequest, NextResponse } from "next/server";
import { buildRamsApiUrl } from "@/lib/auth/config";
import { clearLoginSession, getAccessToken, getRefreshToken } from "@/lib/auth/session";
import { backendRequestHeaders, rejectUntrustedMutation } from "@/lib/auth/requestSecurity";

export async function POST(request: NextRequest) {
const rejected = rejectUntrustedMutation(request);
if (rejected) return rejected;

const accessToken = await getAccessToken();
const refreshToken = await getRefreshToken();

  try {
    if (accessToken) {
await fetch(buildRamsApiUrl("/auth/logout"), {
method: "POST",
headers: (() => {
const headers = backendRequestHeaders(request);
headers.set("Authorization", `Bearer ${accessToken}`);
return headers;
})(),
body: JSON.stringify({ refresh_token: refreshToken, all_sessions: false }),
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

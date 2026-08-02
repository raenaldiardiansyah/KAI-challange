import { NextRequest } from "next/server";
import { buildRamsApiUrl } from "@/lib/auth/config";
import { authError, relayRamsResponse } from "@/lib/auth/response";
import { backendRequestHeaders, rejectUntrustedMutation } from "@/lib/auth/requestSecurity";

type RegisterPayload = {
  name?: string;
  username?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
const rejected = rejectUntrustedMutation(request);
if (rejected) return rejected;

let payload: RegisterPayload;

  try {
    payload = await request.json();
  } catch {
    return authError("Request pendaftaran tidak valid.", 400);
  }

  if (!payload.name?.trim() || !payload.username?.trim() || !payload.password) {
    return authError("Nama, username, dan password wajib diisi.", 422);
  }

  try {
    const response = await fetch(buildRamsApiUrl("/auth/register"), {
      method: "POST",
headers: backendRequestHeaders(request),
      body: JSON.stringify({
        name: payload.name.trim(),
        username: payload.username.trim(),
        password: payload.password
      }),
      cache: "no-store"
    });
    return relayRamsResponse(response);
  } catch {
    return authError("RAMS Backend tidak dapat dihubungi.", 503);
  }
}

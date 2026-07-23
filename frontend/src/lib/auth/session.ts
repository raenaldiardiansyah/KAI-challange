import { cookies } from "next/headers";
import type { RamsLoginResponse, RamsRefreshResponse } from "@/types/auth";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildRamsApiUrl
} from "./config";

const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}

export async function setLoginSession(payload: RamsLoginResponse) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, payload.access_token, cookieOptions(payload.expires_in));

  if (payload.refresh_token) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, payload.refresh_token, cookieOptions(DEFAULT_REFRESH_MAX_AGE));
  }
}

export async function clearLoginSession() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", cookieOptions(0));
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", cookieOptions(0));
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function refreshLoginSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(buildRamsApiUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store"
  });

  if (!response.ok) {
    await clearLoginSession();
    return null;
  }

  const payload = await response.json() as RamsRefreshResponse;
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, payload.access_token, cookieOptions(payload.expires_in));
  cookieStore.set(REFRESH_TOKEN_COOKIE, payload.refresh_token, cookieOptions(DEFAULT_REFRESH_MAX_AGE));
  return payload.access_token;
}

function withAuthorization(init: RequestInit, accessToken: string) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...init, headers, cache: "no-store" as RequestCache };
}

export async function fetchRamsWithSession(path: string, init: RequestInit = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return new Response(JSON.stringify({ detail: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = buildRamsApiUrl(path);
  let response = await fetch(url, withAuthorization(init, accessToken));

  if (response.status !== 401) return response;

  const refreshedAccessToken = await refreshLoginSession();
  if (!refreshedAccessToken) return response;

  response = await fetch(url, withAuthorization(init, refreshedAccessToken));
  return response;
}

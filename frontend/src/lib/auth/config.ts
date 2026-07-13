export const ACCESS_TOKEN_COOKIE = "rams_access_token";
export const REFRESH_TOKEN_COOKIE = "rams_refresh_token";

export function getRamsApiBaseUrl() {
  const backendUrl = process.env.RAMS_BACKEND_URL?.trim() || "http://localhost:8000";
  return `${backendUrl.replace(/\/$/, "")}/api/v1`;
}

export function buildRamsApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getRamsApiBaseUrl()}${normalizedPath}`;
}

export function isRamsAuthEnabled() {
  return process.env.RAMS_AUTH_ENABLED === "true";
}

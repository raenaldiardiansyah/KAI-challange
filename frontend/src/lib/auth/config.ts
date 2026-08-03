export const ACCESS_TOKEN_COOKIE = "rams_access_token";
export const REFRESH_TOKEN_COOKIE = "rams_refresh_token";

function apiBaseUrl(backendUrl: string) {
  return `${backendUrl.replace(/\/$/, "")}/api/v1`;
}

function buildApiUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function getAuthApiBaseUrl() {
  const backendUrl = process.env.AUTH_BACKEND_URL?.trim()
    || process.env.RAMS_BACKEND_URL?.trim()
    || "http://localhost:8000";
  return apiBaseUrl(backendUrl);
}

export function getRamsDataApiBaseUrl() {
  const backendUrl = process.env.RAMS_DATA_BACKEND_URL?.trim()
    || process.env.RAMS_BACKEND_URL?.trim()
    || process.env.AUTH_BACKEND_URL?.trim()
    || "http://localhost:8000";
  return apiBaseUrl(backendUrl);
}

export function buildAuthApiUrl(path: string) {
  return buildApiUrl(getAuthApiBaseUrl(), path);
}

export function buildRamsDataApiUrl(path: string) {
  return buildApiUrl(getRamsDataApiBaseUrl(), path);
}

export function isRamsAuthEnabled() {
  return process.env.RAMS_AUTH_ENABLED === "true";
}

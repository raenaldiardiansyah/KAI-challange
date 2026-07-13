import { createApiError } from "./errors";
import { readLiveCache, writeLiveCache } from "./liveDataCache";

const inFlightRequests = new Map<string, Promise<RamsApiResult<unknown>>>();

type QueryValue = string | number | boolean | null | undefined;
export type RamsQuery = Record<string, QueryValue>;

export type RamsApiResult<T> = {
  data: T;
  source: "live" | "cache";
  stale: boolean;
  fetchedAt: string;
};

export type RamsRequestOptions = Omit<RequestInit, "body"> & {
  query?: RamsQuery;
  body?: unknown;
  cacheKey?: string;
  allowCachedFallback?: boolean;
};

export function buildRamsBffUrl(path: string, query: RamsQuery = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const suffix = params.toString();
  return `/api/rams${normalizedPath}${suffix ? `?${suffix}` : ""}`;
}

export async function requestRams<T>(path: string, options: RamsRequestOptions = {}): Promise<RamsApiResult<T>> {
  const { query, body, cacheKey, allowCachedFallback, headers, ...init } = options;
  const url = buildRamsBffUrl(path, query);
  const key = cacheKey ?? url;
  const method = (init.method ?? "GET").toUpperCase();
  const canUseCache = allowCachedFallback ?? method === "GET";

  if (method === "GET") {
    const pending = inFlightRequests.get(key);
    if (pending) return pending as Promise<RamsApiResult<T>>;
  }

  const execute = async () => {
    try {
      const response = await fetch(url, {
        ...init,
        method,
        headers: {
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...headers
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store"
      });
      if (!response.ok) throw await createApiError(response);
      const data = await response.json() as T;
      const fetchedAt = new Date().toISOString();
      if (method === "GET") writeLiveCache(key, data);
      return { data, source: "live" as const, stale: false, fetchedAt };
    } catch (error) {
      const cached = canUseCache ? readLiveCache<T>(key) : null;
      if (cached) return { data: cached.data, source: "cache" as const, stale: true, fetchedAt: cached.savedAt };
      throw error;
    } finally {
      if (method === "GET") inFlightRequests.delete(key);
    }
  };

  const pending = execute();
  if (method === "GET") inFlightRequests.set(key, pending as Promise<RamsApiResult<unknown>>);
  return pending;
}

export function mapRamsResult<TSource, TTarget>(
  result: RamsApiResult<TSource>,
  mapper: (data: TSource) => TTarget
): RamsApiResult<TTarget> {
  return { ...result, data: mapper(result.data) };
}

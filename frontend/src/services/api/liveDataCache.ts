type CacheEntry<T> = { data: T; savedAt: string };

const CACHE_PREFIX = "kai-rams-live-cache:";

export function readLiveCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) as CacheEntry<T> : null;
  } catch {
    return null;
  }
}

export function writeLiveCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, savedAt: new Date().toISOString() })
    );
  } catch {
    // Storage can be unavailable or full; live data remains usable without cache.
  }
}

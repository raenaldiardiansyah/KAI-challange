export type DataMode = "dummy" | "live";

const STORAGE_KEY = "kai-rams-data-mode";
const subscribers = new Set<() => void>();

export function isLiveApiAllowed() {
  return process.env.NEXT_PUBLIC_ALLOW_LIVE_API === "true";
}

export function getDefaultDataMode(): DataMode {
  return process.env.NEXT_PUBLIC_USE_DUMMY === "false" && isLiveApiAllowed()
    ? "live"
    : "dummy";
}

export function getDataMode(): DataMode {
  if (typeof window === "undefined") return getDefaultDataMode();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "live" && isLiveApiAllowed() ? "live" : "dummy";
}

export function setDataMode(mode: DataMode) {
  const nextMode = mode === "live" && !isLiveApiAllowed() ? "dummy" : mode;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, nextMode);
  subscribers.forEach((subscriber) => subscriber());
}

export function subscribeDataMode(subscriber: () => void) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

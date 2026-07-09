// src/lib/dashboardScale.ts

export type DashboardScale = 0.5 | 0.75 | 1;

const STORAGE_KEY = "dashboard-scale";
const EVENT_NAME = "dashboard-scale-change";

export function getDashboardScale(): DashboardScale {
  if (typeof window === "undefined") return 0.5;

  const value = window.localStorage.getItem(STORAGE_KEY);

  if (value === "0.75") return 0.75;
  if (value === "1") return 1;

  return 0.5;
}

export function setDashboardScale(scale: DashboardScale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, String(scale));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: scale }));
}

export function subscribeDashboardScale(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

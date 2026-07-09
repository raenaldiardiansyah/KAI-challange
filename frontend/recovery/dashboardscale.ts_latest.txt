export const DASHBOARD_SCALE_STORAGE_KEY = "dashboard-scale";
export const DASHBOARD_SCALE_CHANGE_EVENT = "dashboard-scale-change";
export const DEFAULT_DASHBOARD_SCALE = 0.5;
export const DASHBOARD_SCALE_OPTIONS = [0.5, 0.75, 1] as const;

export type DashboardScale = typeof DASHBOARD_SCALE_OPTIONS[number];

export function isDashboardScale(value: unknown): value is DashboardScale {
  return value === 0.5 || value === 0.75 || value === 1;
}

export function parseDashboardScale(value: string | null): DashboardScale {
  const parsed = Number(value);
  return isDashboardScale(parsed) ? parsed : DEFAULT_DASHBOARD_SCALE;
}

export function getInitialDashboardScale(): DashboardScale {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD_SCALE;
  return parseDashboardScale(window.localStorage.getItem(DASHBOARD_SCALE_STORAGE_KEY));
}

export function getDashboardScaleServerSnapshot(): DashboardScale {
  return DEFAULT_DASHBOARD_SCALE;
}

export function subscribeDashboardScale(callback: () => void) {
  const handleScaleChange = () => callback();
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === DASHBOARD_SCALE_STORAGE_KEY) callback();
  };

  window.addEventListener(DASHBOARD_SCALE_CHANGE_EVENT, handleScaleChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(DASHBOARD_SCALE_CHANGE_EVENT, handleScaleChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function saveDashboardScale(scale: DashboardScale) {
  window.localStorage.setItem(DASHBOARD_SCALE_STORAGE_KEY, String(scale));
  window.dispatchEvent(new CustomEvent(DASHBOARD_SCALE_CHANGE_EVENT, { detail: scale }));
}

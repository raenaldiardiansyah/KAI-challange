export type ReportPeriod = "today" | "week" | "month" | "year";

export type ReportFilterValues = {
  period: ReportPeriod;
  trainsetId: string;       // "all_ts" | actual trainset ID
  subsystem: string;        // "all_sub" | subsystem key
};

/** Subsystem filter key → display label mapping */
export const SUBSYSTEM_OPTIONS: Record<string, string> = {
  all_sub: "Semua Subsistem",
  brake: "Brake System",
  hvac: "HVAC",
  door: "Door",
  genset: "Genset",
  pids: "PIDS",
  communication: "Communication",
};

/** Map subsystem filter key → SubsystemName values used in alarm data */
export const SUBSYSTEM_KEY_MAP: Record<string, string> = {
  brake: "Brake System",
  hvac: "HVAC",
  door: "Door",
  genset: "Genset",
  pids: "PIDS",
  communication: "Communication",
};

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: "Hari Ini",
  week: "Minggu Ini",
  month: "Bulan Ini",
  year: "Tahun Ini",
};

export const DEFAULT_FILTER: ReportFilterValues = {
  period: "month",
  trainsetId: "all_ts",
  subsystem: "all_sub",
};

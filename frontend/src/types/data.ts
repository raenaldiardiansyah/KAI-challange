export type DataSource = "dummy" | "live" | "local" | "prototype";

export type SectionData<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: DataSource;
  stale: boolean;
  fromCache: boolean;
  generatedAt: string | null;
  fetchedAt: string | null;
};

export type ResourceStatus = Pick<
  SectionData<unknown>,
  "source" | "stale" | "fromCache" | "generatedAt" | "fetchedAt" | "error"
>;

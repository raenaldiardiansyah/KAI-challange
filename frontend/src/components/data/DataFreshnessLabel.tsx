import type { DataSource } from "@/types/data";
import { formatTimestamp } from "@/adapters/normalizers";
import styles from "./DataFreshnessLabel.module.css";

type Props = {
  source: DataSource;
  stale: boolean;
  fromCache: boolean;
  generatedAt: string | null;
  fetchedAt: string | null;
  error?: string | null;
};

const labels: Record<DataSource, string> = {
  dummy: "Dummy",
  live: "Live API",
  local: "Lokal",
  prototype: "Prototype"
};

export function DataFreshnessLabel({ source, stale, fromCache, generatedAt, fetchedAt, error }: Props) {
  const status = stale || fromCache ? "Stale cache" : labels[source];
  const timestamp = generatedAt ?? fetchedAt;
  return (
    <div className={styles.label} aria-label="Status sumber data">
      <span className={`${styles.badge} ${source === "live" && !stale ? styles.live : ""} ${stale ? styles.stale : ""}`}>
        {status}
      </span>
      {timestamp ? <span>{generatedAt ? "Dibuat" : "Diambil"}: {formatTimestamp(timestamp)}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}


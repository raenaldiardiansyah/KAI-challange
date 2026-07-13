"use client";

import { Select } from "@/components/ui/Select";
import type { TelemetryFilters } from "@/services/telemetryService";
import styles from "./TelemetryWorkspace.module.css";

export type TelemetryFacet = { value: string; label: string };
export type TelemetryFacets = {
  trainsets: TelemetryFacet[];
  cars: TelemetryFacet[];
  subsystems: TelemetryFacet[];
  signals: TelemetryFacet[];
  qualities: TelemetryFacet[];
};

const filterLabels: Array<[keyof TelemetryFilters, string]> = [
  ["trainsetId", "Trainset"], ["carId", "Gerbong"], ["subsystem", "Subsistem"],
  ["signalName", "Signal"], ["qualityStatus", "Kualitas"]
];

export function TelemetryFilter({ filters, facets, total, filtered, onChange }: {
  filters: TelemetryFilters;
  facets: TelemetryFacets;
  total: number;
  filtered: number;
  onChange: (filters: TelemetryFilters) => void;
}) {
  const active = filterLabels.filter(([key]) => Boolean(filters[key]));
  const facetByKey: Partial<Record<keyof TelemetryFilters, TelemetryFacet[]>> = {
    trainsetId: facets.trainsets, carId: facets.cars, subsystem: facets.subsystems,
    signalName: facets.signals, qualityStatus: facets.qualities
  };
  const displayValue = (key: keyof TelemetryFilters) => facetByKey[key]?.find((item) => item.value === filters[key])?.label ?? String(filters[key]);
  const setFilter = (key: keyof TelemetryFilters, value: string) => onChange({ ...filters, [key]: value || undefined });
  const select = (label: string, key: keyof TelemetryFilters, options: TelemetryFacet[]) => (
    <Select aria-label={label} value={String(filters[key] ?? "")} onChange={(event) => setFilter(key, event.target.value)}>
      <option value="">Semua {label}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </Select>
  );
  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <span className={styles.filterTitle}>Eksplorasi Telemetri</span>
        <span className={styles.resultCount}>{filtered} dari {total} rekaman</span>
      </div>
      <div className={styles.filterControls}>
        {select("Trainset", "trainsetId", facets.trainsets)}
        {select("Gerbong", "carId", facets.cars)}
        {select("Subsistem", "subsystem", facets.subsystems)}
        {select("Signal", "signalName", facets.signals)}
        {select("Kualitas", "qualityStatus", facets.qualities)}
      </div>
      <div className={styles.filterFooter}>
        <div className={styles.chipList}>
          {active.map(([key, label]) => (
            <button className={styles.chip} key={key} onClick={() => setFilter(key, "")} aria-label={`Hapus filter ${label}`}>
              {label}: {displayValue(key)} ×
            </button>
          ))}
          {active.length === 0 ? <span className={styles.resultCount}>Tanpa filter aktif</span> : null}
        </div>
        {active.length > 0 ? <button className={styles.reset} onClick={() => onChange({ limit: filters.limit })}>Reset filter</button> : null}
      </div>
    </div>
  );
}

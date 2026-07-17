"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { ReportFilterValues, ReportPeriod } from "@/types/reportFilter";
import { SUBSYSTEM_OPTIONS, PERIOD_LABELS } from "@/types/reportFilter";
import type { Trainset } from "@/types/trainset";

type ReportFilterProps = {
  values: ReportFilterValues;
  onChange: (values: ReportFilterValues) => void;
  trainsets: Trainset[];
};

export function ReportFilter({ values, onChange, trainsets }: ReportFilterProps) {
  const [status, setStatus] = useState("");
  const update = (patch: Partial<ReportFilterValues>) =>
    onChange({ ...values, ...patch });

  return (
    <div
      className="filter-row"
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #d8e0e7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}
        >
          Parameter Laporan:
        </span>

        {/* Period selector */}
        <Select
          value={values.period}
          onChange={(e) => update({ period: e.target.value as ReportPeriod })}
        >
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>

        {/* Trainset selector */}
        <Select
          value={values.trainsetId}
          onChange={(e) => update({ trainsetId: e.target.value })}
        >
          <option value="all_ts">Semua Armada</option>
          {trainsets.map((ts) => (
            <option key={ts.id} value={ts.id}>
              {ts.name}
            </option>
          ))}
        </Select>

        {/* Subsystem selector */}
        <Select
          value={values.subsystem}
          onChange={(e) => update({ subsystem: e.target.value })}
        >
          {Object.entries(SUBSYSTEM_OPTIONS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>

        <Button
          variant="secondary"
          style={{ marginLeft: "auto" }}
          onClick={() => setStatus("Preview laporan diperbarui dari filter aktif. Export PDF/Excel menunggu integrasi backend.")}
        >
          Generate Report
        </Button>
        {status ? <span className="report-export-status">{status}</span> : null}
      </div>
    </div>
  );
}

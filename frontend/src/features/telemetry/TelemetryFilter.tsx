"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type { TelemetryFilters } from "@/services/telemetryService";

export function TelemetryFilter({ filters, onChange }: { filters: TelemetryFilters; onChange: (filters: TelemetryFilters) => void }) {
  return (
    <div className="filter-row" style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #d8e0e7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", flexWrap: "wrap" }}>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}>Eksplorasi Telemetri:</span>
        
        <Input aria-label="Trainset ID" placeholder="Trainset ID" value={filters.trainsetId ?? ""} onChange={(event) => onChange({ ...filters, trainsetId: event.target.value || undefined })} />
        <Input aria-label="Car ID" placeholder="Car ID" value={filters.carId ?? ""} onChange={(event) => onChange({ ...filters, carId: event.target.value || undefined })} />

        <Select aria-label="Signal" value={filters.signalName ?? ""} onChange={(event) => onChange({ ...filters, signalName: event.target.value || undefined })}>
          <option value="">Semua Signal</option>
          <option value="brake_pipe">Brake Pipe</option>
          <option value="brake_cylinder">Brake Cylinder</option>
        </Select>
        
        <Select aria-label="Subsystem" value={filters.subsystem ?? ""} onChange={(event) => onChange({ ...filters, subsystem: event.target.value || undefined })}>
          <option value="">Semua Subsistem</option>
          <option value="PRESSURE">Pressure (Brake Pipe/Brake Cylinder)</option>
          <option value="AC">AC</option>
        </Select>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Rentang Waktu (Prototype):</span>
          <Input aria-label="Tanggal mulai Prototype" type="datetime-local" disabled />
          <span>-</span>
          <Input aria-label="Tanggal akhir Prototype" type="datetime-local" disabled />
        </div>
      </div>
    </div>
  );
}

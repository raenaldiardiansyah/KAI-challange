"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export function TelemetryFilter() {
  return (
    <div className="filter-row" style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #d8e0e7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", flexWrap: "wrap" }}>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}>Eksplorasi Telemetri:</span>
        
        <Select defaultValue="brake">
          <option value="BP">Brake Pipe</option>
          <option value="BC">Brake Cylinder</option>
        </Select>
        
        <Select defaultValue="pressure">
          <option value="pressure">Pressure (Brake Pipe/Brake Cylinder)</option>
          <option value="voltage">Voltage</option>
          <option value="temp">Temperature</option>
        </Select>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Rentang Waktu:</span>
          <Input type="datetime-local" defaultValue="2026-07-01T00:00" />
          <span>-</span>
          <Input type="datetime-local" defaultValue="2026-07-02T23:59" />
        </div>
      </div>
    </div>
  );
}

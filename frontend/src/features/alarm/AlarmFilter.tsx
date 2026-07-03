import { Select } from "@/components/ui/Select";

export function AlarmFilter() {
  return (
    <div className="filter-row alarm-filter-vertical" style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #d8e0e7" }}>
      <div>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}>Filter:</span>
        <Select defaultValue="all" aria-label="Armada filter">
          <option value="all">Semua Armada</option>
          <option value="ts1">Anggrek Lembah</option>
          <option value="ts2">Argo Wilis</option>
        </Select>
        <Select defaultValue="all" aria-label="Subsistem filter">
          <option value="all">Semua Subsistem</option>
          <option value="brake">Brake</option>
          <option value="door">Door</option>
        </Select>
        <Select defaultValue="all" aria-label="Severity filter">
          <option value="all">Semua Tingkat (Severity)</option>
          <option value="critical">Kritis (Critical)</option>
          <option value="high">Tinggi (High)</option>
          <option value="medium">Sedang (Medium)</option>
        </Select>
        <Select defaultValue="open" aria-label="Status filter">
          <option value="all">Semua Status</option>
          <option value="open">Terbuka (Open)</option>
          <option value="ack">Diketahui (Ack)</option>
          <option value="closed">Selesai (Closed)</option>
        </Select>
      </div>
    </div>
  );
}

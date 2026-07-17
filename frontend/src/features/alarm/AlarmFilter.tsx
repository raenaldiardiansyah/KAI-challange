import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Alarm } from "@/types/alarm";
import type { AlarmStatus, Severity, SubsystemName } from "@/types/common";

type AlarmFilterProps = {
  query: string;
  suggestions: Alarm[];
  trainsetFilter: string;
  subsystemFilter: "all" | SubsystemName;
  severityFilter: "all" | Severity;
  statusFilter: "all" | AlarmStatus;
  onQueryChange: (query: string) => void;
  onSuggestionClick: (alarm: Alarm) => void;
  onTrainsetFilterChange: (value: string) => void;
  onSubsystemFilterChange: (value: "all" | SubsystemName) => void;
  onSeverityFilterChange: (value: "all" | Severity) => void;
  onStatusFilterChange: (value: "all" | AlarmStatus) => void;
};

export function AlarmFilter({
  query,
  suggestions,
  trainsetFilter,
  subsystemFilter,
  severityFilter,
  statusFilter,
  onQueryChange,
  onSuggestionClick,
  onTrainsetFilterChange,
  onSubsystemFilterChange,
  onSeverityFilterChange,
  onStatusFilterChange
}: AlarmFilterProps) {
  return (
    <div className="filter-row alarm-filter-vertical" style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #d8e0e7" }}>
      <div>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}>Filter:</span>
        <div className="alarm-search-box">
          <MagnifyingGlass size={18} />
          <Input
            aria-label="Cari alarm"
            placeholder="Cari alarm, armada, gerbong, subsistem..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {suggestions.length > 0 ? (
            <div className="alarm-search-suggestions">
              {suggestions.map((alarm) => (
                <button key={alarm.id} type="button" onClick={() => onSuggestionClick(alarm)}>
                  <strong>{alarm.trainsetId} - C{alarm.carNumber}</strong>
                  <span>{alarm.subsystem} - {alarm.message}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Select value={trainsetFilter} onChange={(event) => onTrainsetFilterChange(event.target.value)} aria-label="Armada filter">
          <option value="all">Semua Armada</option>
          <option value="TS-001">TS-001</option>
          <option value="TS-002">TS-002</option>
          <option value="TS-003">TS-003</option>
        </Select>
        <Select value={subsystemFilter} onChange={(event) => onSubsystemFilterChange(event.target.value as "all" | SubsystemName)} aria-label="Subsistem filter">
          <option value="all">Semua Subsistem</option>
          <option value="Brake System">Brake System</option>
          <option value="door">Door</option>
          <option value="HVAC">HVAC</option>
          <option value="Genset">Genset</option>
          <option value="PIDS">PIDS</option>
          <option value="Communication">Communication</option>
        </Select>
        <Select value={severityFilter} onChange={(event) => onSeverityFilterChange(event.target.value as "all" | Severity)} aria-label="Severity filter">
          <option value="all">Semua Tingkat (Severity)</option>
          <option value="Critical">Kritis (Critical)</option>
          <option value="High">Tinggi (High)</option>
          <option value="Medium">Sedang (Medium)</option>
          <option value="Low">Rendah (Low)</option>
        </Select>
        <Select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as "all" | AlarmStatus)} aria-label="Status filter">
          <option value="all">Semua Status</option>
          <option value="Open">Terbuka (Open)</option>
          <option value="Acknowledged">Diketahui (Ack)</option>
          <option value="Closed">Selesai (Closed)</option>
          <option value="Auto Cleared">Selesai Otomatis</option>
        </Select>
      </div>
    </div>
  );
}

"use client";

import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";

type TrainsetInfo = { id: string; name: string; };

export function CarSelectorFilter({ 
  defaultCar = "5", 
  defaultTrainset,
  trainsets = [], 
  issueTrainsets = [], 
  issueCarsByTrainset = {},
  totalCarsByTrainset = {}
}: { 
  defaultCar?: string;
  defaultTrainset?: string;
  trainsets?: TrainsetInfo[];
  issueTrainsets?: string[];
  issueCarsByTrainset?: Record<string, number[]>;
  totalCarsByTrainset?: Record<string, number>;
}) {
  const router = useRouter();
  const selectedTrainset = defaultTrainset ?? trainsets[0]?.id ?? "TS-001";
  const issueCars = issueCarsByTrainset[selectedTrainset] ?? [];
  const totalCars = totalCarsByTrainset[selectedTrainset] ?? 10;

  const handleTrainsetChange = (trainsetId: string) => {
    const nextIssueCars = issueCarsByTrainset[trainsetId] ?? [];
    const nextCar = nextIssueCars[0] ?? 1;
    router.push(`?trainset=${trainsetId}&car=${nextCar}`);
  };

  return (
    <div className="filter-row" style={{ marginBottom: "16px", background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #d8e0e7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b" }}>Filter Gerbong:</span>
        <Select value={selectedTrainset} aria-label="Armada" onChange={(event) => handleTrainsetChange(event.target.value)}>
          {trainsets.map(ts => {
            const hasIssue = issueTrainsets.includes(ts.id);
            return (
              <option key={ts.id} value={ts.id} style={{ color: hasIssue ? "#ef4444" : "inherit" }}>
                {ts.name} {hasIssue ? "(Bermasalah)" : ""}
              </option>
            );
          })}
          {trainsets.length === 0 && (
            <>
              <option value="ts001">Anggrek Lembah M02406</option>
              <option value="ts002">Argo Wilis M02511</option>
            </>
          )}
        </Select>
        <Select 
          value={defaultCar} 
          aria-label="Gerbong"
          onChange={(e) => router.push(`?trainset=${selectedTrainset}&car=${e.target.value}`)}
        >
          {Array.from({ length: totalCars }, (_, i) => i + 1).map(car => {
            const hasIssue = issueCars.includes(car);
            return (
              <option key={car} value={car.toString()} style={{ color: hasIssue ? "#ef4444" : "inherit" }}>
                Gerbong {car} {hasIssue ? "(!)" : ""}
              </option>
            );
          })}
        </Select>
        <Select defaultValue="all" aria-label="Subsistem">
          <option value="all">Semua Subsistem</option>
          <option value="brake">Brake System</option>
          <option value="door">Door</option>
          <option value="hvac">HVAC</option>
        </Select>
      </div>
    </div>
  );
}

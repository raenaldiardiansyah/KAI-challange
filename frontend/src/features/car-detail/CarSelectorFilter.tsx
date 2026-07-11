"use client";

import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";

type TrainsetInfo = { id: string; name: string; };

export function CarSelectorFilter({ 
  defaultCar = "5", 
  defaultTrainset,
  defaultSubsystem = "all",
  trainsets = [], 
  issueTrainsets = [], 
  issueCarsByTrainset = {},
  totalCarsByTrainset = {},
  availableSubsystems = []
}: { 
  defaultCar?: string;
  defaultTrainset?: string;
  defaultSubsystem?: string;
  trainsets?: TrainsetInfo[];
  issueTrainsets?: string[];
  issueCarsByTrainset?: Record<string, number[]>;
  totalCarsByTrainset?: Record<string, number>;
  availableSubsystems?: string[];
}) {
  const router = useRouter();
  const selectedTrainset = defaultTrainset ?? trainsets[0]?.id ?? "TS-001";
  const issueCars = issueCarsByTrainset[selectedTrainset] ?? [];
  const totalCars = totalCarsByTrainset[selectedTrainset] ?? 10;

  const buildDetailUrl = (trainsetId: string, car: string | number, subsystem = defaultSubsystem) => {
    const params = new URLSearchParams({
      trainset: trainsetId,
      car: car.toString()
    });

    if (subsystem !== "all") {
      params.set("subsystem", subsystem);
    }

    return `?${params.toString()}`;
  };

  const handleTrainsetChange = (trainsetId: string) => {
    const nextIssueCars = issueCarsByTrainset[trainsetId] ?? [];
    const nextCar = nextIssueCars[0] ?? 1;
    router.push(buildDetailUrl(trainsetId, nextCar));
  };

  return (
    <div className="filter-row car-selector-filter">
      <div className="car-selector-filter-inner">
        <span className="car-selector-filter-label">Filter Gerbong:</span>
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
          onChange={(e) => router.push(buildDetailUrl(selectedTrainset, e.target.value))}
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
        <Select
          value={defaultSubsystem}
          aria-label="Subsistem"
          onChange={(event) => router.push(buildDetailUrl(selectedTrainset, defaultCar, event.target.value))}
        >
          <option value="all">Semua Subsistem</option>
          {availableSubsystems.map((subsystem) => (
            <option key={subsystem} value={subsystem}>{subsystem}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}

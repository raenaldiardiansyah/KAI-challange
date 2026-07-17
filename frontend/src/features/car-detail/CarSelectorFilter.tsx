"use client";

import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";

type TrainsetInfo = { id: string; name: string; };
type CarOption = { id: string; label: string; order: number };
type SubsystemOption = string | { value: string; label: string };

export function CarSelectorFilter({ 
  defaultCar = "5", 
  defaultTrainset,
  defaultSubsystem = "all",
  trainsets = [], 
  issueTrainsets = [], 
  issueCarsByTrainset = {},
  totalCarsByTrainset = {},
  carOptionsByTrainset = {},
  availableSubsystems = []
}: { 
  defaultCar?: string;
  defaultTrainset?: string;
  defaultSubsystem?: string;
  trainsets?: TrainsetInfo[];
  issueTrainsets?: string[];
  issueCarsByTrainset?: Record<string, number[]>;
  totalCarsByTrainset?: Record<string, number>;
  carOptionsByTrainset?: Record<string, CarOption[]>;
  availableSubsystems?: SubsystemOption[];
}) {
  const router = useRouter();
  const selectedTrainset = defaultTrainset ?? trainsets[0]?.id ?? "TS-001";
  const issueCars = issueCarsByTrainset[selectedTrainset] ?? [];
  const carOptions = carOptionsByTrainset[selectedTrainset] ?? [];

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
    const nextOptions = carOptionsByTrainset[trainsetId] ?? [];
    const nextIssueCars = issueCarsByTrainset[trainsetId] ?? [];
    const nextCar = nextOptions.find((option) => nextIssueCars.includes(option.order))?.id
      ?? nextOptions[0]?.id
      ?? nextIssueCars[0]
      ?? 1;
    router.push(buildDetailUrl(trainsetId, nextCar));
  };

  return (
    <div className="filter-row car-selector-filter">
      <div className="car-selector-filter-inner">
        <span className="car-selector-filter-label">Kode autentik:</span>
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
          aria-label="Kode autentik"
          onChange={(e) => router.push(buildDetailUrl(selectedTrainset, e.target.value))}
        >
          {carOptions.map((car) => {
            const hasIssue = issueCars.includes(car.order);
            return (
              <option key={car.id} value={car.id} style={{ color: hasIssue ? "#ef4444" : "inherit" }}>
                {car.label} {hasIssue ? "(!)" : ""}
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
          {availableSubsystems.map((subsystem) => {
            const option = typeof subsystem === "string" ? { value: subsystem, label: subsystem } : subsystem;
            return <option key={option.value} value={option.value}>{option.label}</option>;
          })}
          {carOptions.length === 0 ? <option value={defaultCar}>Kode backend belum tersedia</option> : null}
        </Select>
      </div>
    </div>
  );
}

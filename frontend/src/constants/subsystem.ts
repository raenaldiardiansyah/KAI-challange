import type { SubsystemDefinition } from "@/types/subsystem";

export const subsystems: SubsystemDefinition[] = [
  { name: "Brake System", signals: ["BP", "BC", "medianBc", "threshold"] },
  { name: "Genset", signals: ["voltage", "frequency", "rpm", "fuelLevel"] },
  { name: "HVAC", signals: ["temperature", "acStatus", "faultStatus"] },
  { name: "Door", signals: ["doorOpenCount", "doorStatus", "doorAnomaly"] },
  { name: "PIDS", signals: ["displayStatus", "audioStatus", "communicationStatus"] }
];

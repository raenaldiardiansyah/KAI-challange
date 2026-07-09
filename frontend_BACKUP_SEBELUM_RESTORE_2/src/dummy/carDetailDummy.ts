import type { CarDetail } from "@/types/car";

export const carDetailDummy: CarDetail[] = [
  {
    id: "CAR-TS001-05",
    trainsetId: "TS-001",
    carNumber: 5,
    role: "Passenger Car",
    healthScore: 42,
    healthStatus: "Alarm",
    brakePipeBar: 4.2,
    brakeCylinderBar: 1.1,
    gensetVoltage: 0,
    gensetFrequency: 0,
    gensetRpm: 0,
    fuelLevel: 0,
    hvacTemperature: 28.4,
    doorOpenCount: 42,
    doorStatus: "Closed",
    subsystems: [
      { subsystem: "Brake System", healthScore: 42, status: "Alarm", evidence: "BC 1.1 bar below median 2.3 bar" },
      { subsystem: "HVAC", healthScore: 76, status: "Watch", evidence: "Temperature 28.4 C" },
      { subsystem: "Door", healthScore: 91, status: "Healthy", evidence: "All doors closed" },
      { subsystem: "PIDS", healthScore: 88, status: "Healthy", evidence: "Display and audio online" }
    ]
  },
  {
    id: "CAR-TS002-02",
    trainsetId: "TS-002",
    carNumber: 2,
    role: "Power Car",
    healthScore: 71,
    healthStatus: "Watch",
    brakePipeBar: 4.1,
    brakeCylinderBar: 2.2,
    gensetVoltage: 384,
    gensetFrequency: 47.8,
    gensetRpm: 1420,
    fuelLevel: 54,
    hvacTemperature: 25.6,
    doorOpenCount: 28,
    doorStatus: "Closed",
    subsystems: [
      { subsystem: "Genset", healthScore: 71, status: "Watch", evidence: "Frequency drift to 47.8 Hz" },
      { subsystem: "Brake System", healthScore: 86, status: "Healthy", evidence: "BP and BC within range" },
      { subsystem: "HVAC", healthScore: 89, status: "Healthy", evidence: "Temperature stable" }
    ]
  }
];

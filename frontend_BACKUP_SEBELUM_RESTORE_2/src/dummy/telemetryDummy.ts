import type { TelemetrySeries } from "@/types/telemetry";

export const telemetryDummy: TelemetrySeries[] = [
  {
    trainsetId: "TS-001",
    carNumber: 5,
    points: [
      { timestamp: "16:10", brakePipeBar: 4.2, brakeCylinderBar: 2.2, temperature: 27.3, gensetVoltage: 0 },
      { timestamp: "16:20", brakePipeBar: 4.2, brakeCylinderBar: 1.8, temperature: 27.8, gensetVoltage: 0 },
      { timestamp: "16:30", brakePipeBar: 4.1, brakeCylinderBar: 1.3, temperature: 28.1, gensetVoltage: 0 },
      { timestamp: "16:40", brakePipeBar: 4.2, brakeCylinderBar: 1.1, temperature: 28.4, gensetVoltage: 0 }
    ]
  },
  {
    trainsetId: "TS-002",
    carNumber: 2,
    points: [
      { timestamp: "16:10", brakePipeBar: 4.4, brakeCylinderBar: 2.5, temperature: 26.8, gensetVoltage: 386 },
      { timestamp: "16:20", brakePipeBar: 4.3, brakeCylinderBar: 2.3, temperature: 27.1, gensetVoltage: 384 },
      { timestamp: "16:30", brakePipeBar: 4.2, brakeCylinderBar: 2.1, temperature: 27.4, gensetVoltage: 381 },
      { timestamp: "16:40", brakePipeBar: 4.2, brakeCylinderBar: 2.0, temperature: 27.6, gensetVoltage: 379 }
    ]
  },
  {
    trainsetId: "TS-003",
    carNumber: 1,
    points: [
      { timestamp: "16:10", brakePipeBar: 4.1, brakeCylinderBar: 2.4, temperature: 28.2, gensetVoltage: 0 },
      { timestamp: "16:20", brakePipeBar: 4.1, brakeCylinderBar: 2.4, temperature: 28.7, gensetVoltage: 0 },
      { timestamp: "16:30", brakePipeBar: 4.0, brakeCylinderBar: 2.2, temperature: 29.1, gensetVoltage: 0 },
      { timestamp: "16:40", brakePipeBar: 4.0, brakeCylinderBar: 2.1, temperature: 29.4, gensetVoltage: 0 }
    ]
  }
];

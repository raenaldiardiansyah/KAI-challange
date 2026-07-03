export type TelemetryPoint = {
  timestamp: string;
  brakePipeBar: number;
  brakeCylinderBar: number;
  temperature: number;
  gensetVoltage: number;
};

export type TelemetrySeries = {
  trainsetId: string;
  carNumber: number;
  points: TelemetryPoint[];
};

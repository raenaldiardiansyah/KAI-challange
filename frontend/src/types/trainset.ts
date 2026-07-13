import type { DataStatus, HealthStatus } from "./common";

export type Trainset = {
  id: string;
  name: string;
  route: string;
  totalCars: number;
  online: boolean;
  dataStatus: DataStatus;
  lastUpdate: string;
  healthScore: number;
  healthStatus: HealthStatus;
  alarmCount: number;
  location: string;
  speedKph?: number | null;
  onlineCars?: number;
  healthBreakdown?: {
    critical: number;
    warning: number;
    watch: number;
    offline: number;
    degraded: number;
  };
  carHealthSummary?: Array<{
    carId: string;
    displayCode: string;
    healthScore: number | null;
    status: string;
    dataStatus: string;
  }>;
  healthSource?: string | null;
  healthGeneratedAt?: string | null;
};

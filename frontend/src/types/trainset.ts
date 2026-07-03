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
};

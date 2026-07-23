import type { RamsCarDetailDto } from "@/types/api";
import type { CarDetail } from "@/types/car";
import { getCarIdentity } from "./identityAdapter";
import { normalizeScore, numericValue } from "./normalizers";
import { adaptHealthStatus, adaptSubsystem } from "./statusAdapter";

export function adaptCarDetail(dto: RamsCarDetailDto): CarDetail {
  const identity = getCarIdentity(dto.trainset_id, dto.car_id);
  const pressure = dto.subsystems.find((item) => item.subsystem.toUpperCase() === "PRESSURE");
  const ac = dto.subsystems.find((item) => ["AC", "HVAC"].includes(item.subsystem.toUpperCase()));
  const genset = dto.subsystems.find((item) => item.subsystem.toUpperCase() === "GENSET");
  const overallScore = dto.subsystems.length
    ? dto.subsystems.reduce((sum, item) => sum + normalizeScore(item.health_score), 0) / dto.subsystems.length
    : 0;
  return {
    id: dto.car_id,
    backendCarId: dto.car_id,
    trainsetId: dto.trainset_id,
    carNumber: identity.order,
    role: identity.displayCode,
    healthScore: Math.round(overallScore),
    healthStatus: adaptHealthStatus(dto.subsystems[0]?.status),
    brakePipeBar: numericValue(pressure?.latest_values.brake_pipe),
    brakeCylinderBar: numericValue(pressure?.latest_values.brake_cylinder),
    gensetVoltage: numericValue(genset?.latest_values.voltage),
    gensetFrequency: numericValue(genset?.latest_values.frequency),
    gensetRpm: numericValue(genset?.latest_values.rpm),
    fuelLevel: numericValue(genset?.latest_values.fuel_level),
    hvacTemperature: numericValue(ac?.latest_values.temperature),
    doorOpenCount: 0,
    doorStatus: "Belum tersedia",
    subsystems: dto.subsystems.map((item) => ({
      subsystem: adaptSubsystem(item.subsystem),
      healthScore: normalizeScore(item.health_score),
      status: adaptHealthStatus(item.status),
      evidence: item.last_update ?? "Belum tersedia"
    }))
  };
}

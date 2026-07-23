import type { RamsPredictiveDto } from "@/types/api";
import type { MaintenanceRisk } from "@/types/maintenance";
import { getCarIdentity } from "./identityAdapter";
import { normalizeScore } from "./normalizers";
import { adaptSeverity, adaptSubsystem } from "./statusAdapter";

export function adaptPredictive(dto: RamsPredictiveDto): MaintenanceRisk {
  const car = dto.car_id ? getCarIdentity(dto.trainset_id, dto.car_id) : null;
  return {
    id: String(dto.id),
    trainsetId: dto.trainset_id,
    carNumber: car?.order ?? 0,
    subsystem: adaptSubsystem(dto.subsystem),
    severity: adaptSeverity(dto.predicted_status),
    riskScore: normalizeScore(dto.risk_score),
    timeToWarning: "Prototype",
    recommendation: dto.recommendation,
    workOrderReady: false,
    carId: dto.car_id,
    predictionType: dto.prediction_type,
    predictedStatus: dto.predicted_status,
    features: dto.features,
    createdAt: dto.created_at
  };
}

export function adaptPredictiveList(items: RamsPredictiveDto[]) {
  return items.map(adaptPredictive);
}

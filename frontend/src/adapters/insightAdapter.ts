import type { RamsInsightDto } from "@/types/api";
import type { Insight } from "@/types/insight";
import { getCarIdentity, getTrainsetIdentity } from "./identityAdapter";
import { normalizeScore } from "./normalizers";
import { adaptSeverity, adaptSubsystem } from "./statusAdapter";

export function adaptInsight(dto: RamsInsightDto): Insight {
  const trainset = getTrainsetIdentity(dto.trainset_id);
  const car = dto.car_id ? getCarIdentity(dto.trainset_id, dto.car_id) : null;
  return {
    id: String(dto.id),
    trainsetId: dto.trainset_id,
    trainsetName: trainset.displayCode,
    carNumber: car?.order ?? 0,
    subsystem: adaptSubsystem(dto.subsystem),
    event: dto.title,
    severity: adaptSeverity(dto.severity),
    confidence: normalizeScore(dto.confidence_score),
    healthScore: 0,
    diagnosis: dto.technical_explanation || dto.summary,
    risk: dto.severity,
    evidence: {
      sourceEventId: dto.source_event_id ?? "Belum tersedia",
      generatedBy: dto.generated_by,
      backendCarId: dto.car_id ?? "Belum tersedia"
    },
    structuredInsight: { generatedAt: dto.created_at, source: dto.generated_by },
    naturalInsight: dto.summary,
    recommendation: dto.recommended_actions.join("; ") || "Belum tersedia",
    carId: dto.car_id,
    probableCauses: dto.probable_causes,
    recommendedActions: dto.recommended_actions,
    generatedBy: dto.generated_by,
    sourceEventId: dto.source_event_id,
    createdAt: dto.created_at,
    technicalExplanation: dto.technical_explanation,
    llmRecommendation: dto.llm_recommendation
  };
}

export function adaptInsights(items: RamsInsightDto[]) {
  return items.map(adaptInsight);
}

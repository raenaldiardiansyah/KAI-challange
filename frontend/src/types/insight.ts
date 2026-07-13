import type { Severity, SubsystemName } from "./common";

export type Insight = {
  id: string;
  trainsetId: string;
  trainsetName: string;
  carNumber: number;
  subsystem: SubsystemName;
  event: string;
  severity: Severity;
  confidence: number;
  healthScore: number;
  diagnosis: string;
  risk: string;
  evidence: Record<string, string | number>;
  structuredInsight: Record<string, string | number>;
  naturalInsight: string;
  recommendation: string;
  carId?: string | null;
  probableCauses?: string[];
  recommendedActions?: string[];
  generatedBy?: string | null;
  sourceEventId?: number | string | null;
  createdAt?: string | null;
  technicalExplanation?: string | null;
  llmRecommendation?: unknown;
};

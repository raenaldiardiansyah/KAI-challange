import type { MaintenanceRisk } from "@/types/maintenance";

export type RiskFilter = "all" | "high" | "medium" | "watch" | "limited";

export type PredictiveRiskView = MaintenanceRisk & {
  confidence: number;
  trend: "meningkat" | "menurun" | "stabil";
  inspectionWindow: string;
  status: "Siap SPK" | "Perlu validasi" | "Pantau";
  missingTelemetry: number;
  thresholdTime: string;
  impact: string;
  prototypeFields: boolean;
};

export function getRiskFilter(risk: MaintenanceRisk): RiskFilter {
  if (risk.severity === "Critical" || risk.severity === "High") return "high";
  if (risk.severity === "Medium") return "medium";
  if (risk.riskScore < 45) return "watch";
  return "medium";
}

export function buildRiskView(risk: MaintenanceRisk, index: number): PredictiveRiskView {
  return buildRiskViewForSource(risk, index, false);
}

export function buildRiskViewForSource(risk: MaintenanceRisk, index: number, prototypeFields: boolean): PredictiveRiskView {
  const isHigh = getRiskFilter(risk) === "high";
  const confidence = Math.max(68, Math.min(94, risk.riskScore + (isHigh ? 2 : 17) - index * 3));
  const trend = isHigh ? "meningkat" : index % 2 === 0 ? "stabil" : "menurun";

  return {
    ...risk,
    confidence: prototypeFields ? 0 : confidence,
    trend: prototypeFields ? "stabil" : trend,
    inspectionWindow: prototypeFields ? "Prototype" : isHigh ? "Hari ini 16:00-18:00" : "Besok 08:00-11:00",
    status: prototypeFields ? "Perlu validasi" : risk.workOrderReady ? "Siap SPK" : confidence < 80 ? "Perlu validasi" : "Pantau",
    missingTelemetry: prototypeFields ? 0 : isHigh ? 4 : 13 + index * 4,
    thresholdTime: prototypeFields ? "Prototype" : isHigh ? "11 Juli, 17.00" : "13 Juli, 09.00",
    impact: isHigh
      ? "Inspeksi diperlukan sebelum perjalanan berikutnya."
      : "Masih dapat dipantau, tetapi perlu validasi saat window maintenance berikutnya.",
    prototypeFields
  };
}

export function filterRiskViews(risks: PredictiveRiskView[], filter: RiskFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return risks.filter((risk) => {
    const matchesFilter = filter === "all"
      || (filter === "limited" ? risk.missingTelemetry >= 12 : getRiskFilter(risk) === filter);
    const matchesQuery = !normalizedQuery
      || `${risk.trainsetId} gerbong ${risk.carNumber} ${risk.subsystem}`.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
}

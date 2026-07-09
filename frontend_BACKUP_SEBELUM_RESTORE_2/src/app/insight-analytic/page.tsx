import { EvidencePanel } from "@/features/insight/EvidencePanel";
import { HealthScoreCard } from "@/features/insight/HealthScoreCard";
import { InsightSummaryCard } from "@/features/insight/InsightSummaryCard";
import { NaturalInsightPanel } from "@/features/insight/NaturalInsightPanel";
import { RecommendationPanel } from "@/features/insight/RecommendationPanel";
import { StructuredInsightViewer } from "@/features/insight/StructuredInsightViewer";
import { AnalyticFlowDiagram } from "@/features/insight/AnalyticFlowDiagram";
import { getInsights } from "@/services/insightService";

export default async function InsightAnalyticPage() {
  const insights = await getInsights();
  const insight = insights[0]; // Car 5 Anomaly

  return (
    <div className="page-grid insight-layout">
      <section>
        <AnalyticFlowDiagram />
      </section>
      
      <section className="insight-evidence-layout">
        <div className="stack">
          <InsightSummaryCard insight={insight} />
          <NaturalInsightPanel insight={insight} />
          <RecommendationPanel insight={insight} />
        </div>
        
        <aside className="stack">
          <HealthScoreCard insight={insight} />
          <EvidencePanel insight={insight} />
        </aside>
      </section>
      
      <section>
        <StructuredInsightViewer insight={insight} />
      </section>
    </div>
  );
}

import { Warning, Train, Target, Heartbeat } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function PriorityInsightCard({ insight }: { insight: Insight }) {
  const isAlert = insight.severity === "High" || insight.severity === "Critical";

  const bubbleStyle = {
    background: "var(--surface-3, #e2e8f0)",
    color: "var(--text-strong, #0f172a)",
    padding: "4px 10px",
    borderRadius: "16px",
    fontWeight: "600",
    border: "1px solid var(--line, #cbd5e1)",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px"
  };

  return (
    <Card title="Insight Prioritas" eyebrow="Kritis didahulukan" action={<Badge label={insight.severity} severity={insight.severity} />}>
      <div className="priority" style={!isAlert ? { gridTemplateColumns: "1fr" } : {}}>
        {isAlert && <Warning size={28} weight="fill" />}
        <div>
          <h3>{insight.diagnosis}</h3>
          <p>{insight.naturalInsight}</p>
          <div className="meta-row" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={bubbleStyle}>
              <Target size={16} weight="bold" style={{ marginRight: "4px", color: "var(--accent)" }} />
              Akurasi Prediksi: {insight.confidence}%
            </span>
            <span style={bubbleStyle}>
              <Heartbeat size={16} weight="bold" style={{ marginRight: "4px", color: "var(--danger)" }} />
              Kesehatan: {insight.healthScore}%
            </span>
            <span style={bubbleStyle}>
              <Train size={16} weight="bold" style={{ marginRight: "4px" }} />
              {insight.trainsetName} - C{insight.carNumber}
            </span>
          </div>
          <p className="recommendation">{insight.recommendation}</p>
          <Button>Tinjau Bukti</Button>
        </div>
      </div>
    </Card>
  );
}

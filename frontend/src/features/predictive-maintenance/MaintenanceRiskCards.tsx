import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { MaintenanceRisk } from "@/types/maintenance";

export function MaintenanceRiskCards({ risks }: { risks: MaintenanceRisk[] }) {
  return (
    <div className="list-grid">
      {risks.map((risk) => (
        <Card key={risk.id} title={`${risk.subsystem} - ${risk.trainsetId} Car ${risk.carNumber}`} action={<Badge label={risk.severity} severity={risk.severity} />}>
          <strong className="percent-with-delta">
            <span className="percent-value">{risk.riskScore}% risk</span>
            <MetricDelta value={risk.riskScore} inverse compact />
          </strong>
          <p>{risk.recommendation}</p>
          <span>Time to warning: {risk.timeToWarning}</span>
        </Card>
      ))}
    </div>
  );
}

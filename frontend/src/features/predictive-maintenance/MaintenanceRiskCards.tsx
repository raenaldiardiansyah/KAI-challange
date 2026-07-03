import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { MaintenanceRisk } from "@/types/maintenance";

export function MaintenanceRiskCards({ risks }: { risks: MaintenanceRisk[] }) {
  return (
    <div className="list-grid">
      {risks.map((risk) => (
        <Card key={risk.id} title={`${risk.subsystem} - ${risk.trainsetId} Car ${risk.carNumber}`} action={<Badge label={risk.severity} severity={risk.severity} />}>
          <strong>{risk.riskScore}% risk</strong>
          <p>{risk.recommendation}</p>
          <span>Time to warning: {risk.timeToWarning}</span>
        </Card>
      ))}
    </div>
  );
}

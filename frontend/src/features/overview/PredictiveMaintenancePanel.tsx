import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { MaintenanceRisk } from "@/types/maintenance";

export function PredictiveMaintenancePanel({ risks }: { risks: MaintenanceRisk[] }) {
  return (
    <Card title="Pemeliharaan Prediktif" eyebrow="Tindakan berikutnya">
      <div className="stack">
        {risks.map((risk) => (
          <div className="risk-row" key={risk.id}>
            <div>
              <strong>{risk.subsystem} - {risk.trainsetId} Gerbong {risk.carNumber}</strong>
              <p>{risk.recommendation}</p>
            </div>
            <Badge label={risk.severity} severity={risk.severity} />
            <span>{risk.timeToWarning}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
